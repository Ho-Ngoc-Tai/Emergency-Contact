import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notifications.service';
import { EmergencyService } from '../emergency/emergency.service';
export declare class TasksService {
    private prisma;
    private notificationService;
    private emergencyService;
    private readonly logger;
    constructor(prisma: PrismaService, notificationService: NotificationService, emergencyService: EmergencyService);
    checkOverdueCheckIns(): Promise<void>;
    processPendingNotifications(): Promise<void>;
    cleanupOldNotifications(): Promise<void>;
}
