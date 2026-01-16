import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum NotificationType {
  REMINDER = 'REMINDER',
  WARNING = 'WARNING',
  EMERGENCY = 'EMERGENCY',
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Schedule a reminder notification (T-2h before deadline)
   */
  async scheduleReminder(userId: string, scheduledAt: Date): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.REMINDER,
      'Nhắc nhở: Hãy điểm danh trong 2 giờ tới!',
      scheduledAt,
    );
    this.logger.log(`Scheduled REMINDER for user ${userId} at ${scheduledAt}`);
  }

  /**
   * Schedule a warning notification (T-1h before deadline)
   */
  async scheduleWarning(userId: string, scheduledAt: Date): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.WARNING,
      'Cảnh báo: Chỉ còn 1 giờ để điểm danh!',
      scheduledAt,
    );
    this.logger.log(`Scheduled WARNING for user ${userId} at ${scheduledAt}`);
  }

  /**
   * Schedule an emergency alert (T-15m before deadline)
   */
  async scheduleEmergencyAlert(userId: string, scheduledAt: Date): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.EMERGENCY,
      'KHẨN CẤP: Còn 15 phút! Vui lòng điểm danh ngay!',
      scheduledAt,
    );
    this.logger.log(`Scheduled EMERGENCY for user ${userId} at ${scheduledAt}`);
  }

  /**
   * Cancel all scheduled notifications for a user
   */
  async cancelScheduledNotifications(userId: string): Promise<void> {
    await this.prisma.notificationQueue.deleteMany({
      where: {
        userId,
        status: 'PENDING',
      },
    });
    this.logger.log(`Cancelled all pending notifications for user ${userId}`);
  }

  /**
   * Get pending notifications that are ready to be sent
   */
  async getPendingNotifications(): Promise<any[]> {
    const now = new Date();
    return this.prisma.notificationQueue.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: {
          lte: now,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            fcmToken: true,
            notificationsEnabled: true,
          },
        },
      },
    });
  }

  /**
   * Mark notification as sent
   */
  async markAsSent(notificationId: string): Promise<void> {
    await this.prisma.notificationQueue.update({
      where: { id: notificationId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }

  /**
   * Mark notification as failed
   */
  async markAsFailed(notificationId: string): Promise<void> {
    await this.prisma.notificationQueue.update({
      where: { id: notificationId },
      data: {
        status: 'FAILED',
      },
    });
  }

  /**
   * Create a notification in the queue
   */
  private async createNotification(
    userId: string,
    type: NotificationType,
    message: string,
    scheduledAt: Date,
  ): Promise<void> {
    await this.prisma.notificationQueue.create({
      data: {
        userId,
        type,
        message,
        scheduledAt,
        status: 'PENDING',
      },
    });
  }

  /**
   * Send push notification (stub for now, will integrate FCM later)
   */
  async sendPushNotification(fcmToken: string, title: string, body: string): Promise<void> {
    // TODO: Integrate with Firebase Cloud Messaging
    this.logger.log(`[STUB] Sending push notification to ${fcmToken}: ${title} - ${body}`);
    
    // For now, just log. Will implement FCM in Phase 2
    // Example FCM implementation:
    // await admin.messaging().send({
    //   token: fcmToken,
    //   notification: { title, body },
    //   android: { priority: 'high' },
    // });
  }
}
