import { PrismaService } from '../prisma/prisma.service';
export declare enum NotificationType {
    REMINDER = "REMINDER",
    WARNING = "WARNING",
    EMERGENCY = "EMERGENCY"
}
export declare class NotificationService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    scheduleReminder(userId: string, scheduledAt: Date): Promise<void>;
    scheduleWarning(userId: string, scheduledAt: Date): Promise<void>;
    scheduleEmergencyAlert(userId: string, scheduledAt: Date): Promise<void>;
    cancelScheduledNotifications(userId: string): Promise<void>;
    getPendingNotifications(): Promise<any[]>;
    markAsSent(notificationId: string): Promise<void>;
    markAsFailed(notificationId: string): Promise<void>;
    private createNotification;
    sendPushNotification(fcmToken: string, title: string, body: string): Promise<void>;
}
