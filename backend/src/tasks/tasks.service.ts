import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notifications.service';
import { EmergencyService } from '../emergency/emergency.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private emergencyService: EmergencyService,
  ) {}

  /**
   * Check for overdue check-ins every 5 minutes
   * If user hasn't checked in for > 24h, trigger emergency
   */
  @Cron('*/5 * * * *')
  async checkOverdueCheckIns() {
    this.logger.log('Running overdue check-ins check...');

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Find users who haven't checked in for 24+ hours
    const overdueUsers = await this.prisma.user.findMany({
      where: {
        isActive: true,
        emergencyCallEnabled: true,
        subscriptionActive: true,
        OR: [
          { lastCheckInAt: { lt: twentyFourHoursAgo } },
          { lastCheckInAt: null },
        ],
      },
      select: {
        id: true,
        fullName: true,
        lastCheckInAt: true,
        lastEmergencyTrigger: true,
      },
    });

    this.logger.log(`Found ${overdueUsers.length} overdue users`);

    for (const user of overdueUsers) {
      // Don't trigger if already triggered in last hour
      if (
        user.lastEmergencyTrigger &&
        now.getTime() - user.lastEmergencyTrigger.getTime() < 60 * 60 * 1000
      ) {
        continue;
      }

      this.logger.warn(`Triggering emergency for user ${user.id} (${user.fullName})`);
      
      // Create alert
      await this.emergencyService.createAlert(user.id);
      
      // Trigger emergency call/SMS
      await this.emergencyService.triggerEmergencyCall(user.id);
    }
  }

  /**
   * Process pending notifications every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processPendingNotifications() {
    const notifications = await this.notificationService.getPendingNotifications();

    if (notifications.length === 0) return;

    this.logger.log(`Processing ${notifications.length} pending notifications`);

    for (const notification of notifications) {
      try {
        if (!notification.user.notificationsEnabled) {
          await this.notificationService.markAsFailed(notification.id);
          continue;
        }

        if (notification.user.fcmToken) {
          await this.notificationService.sendPushNotification(
            notification.user.fcmToken,
            'Nhắc nhở điểm danh',
            notification.message,
          );
          await this.notificationService.markAsSent(notification.id);
        } else {
          this.logger.warn(`User ${notification.userId} has no FCM token`);
          await this.notificationService.markAsFailed(notification.id);
        }
      } catch (error) {
        this.logger.error(`Failed to send notification ${notification.id}:`, error);
        await this.notificationService.markAsFailed(notification.id);
      }
    }
  }

  /**
   * Clean up old notifications (older than 7 days)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldNotifications() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const result = await this.prisma.notificationQueue.deleteMany({
      where: {
        createdAt: { lt: sevenDaysAgo },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old notifications`);
  }
}
