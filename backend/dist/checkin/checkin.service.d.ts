import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../gateways/events.gateway';
import { NotificationService } from '../notifications/notifications.service';
export declare class CheckinService {
    private prisma;
    private eventsGateway;
    private notificationService;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway, notificationService: NotificationService);
    recordCheckIn(userId: string, ipAddress?: string, userAgent?: string): Promise<{
        checkIn: {
            id: string;
            userId: string;
            checkedInAt: Date;
            ipAddress: string | null;
            userAgent: string | null;
            location: string | null;
        };
        streak: number;
        nextCheckInDue: Date;
    }>;
    getCheckInHistory(userId: string, limit?: number): Promise<{
        id: string;
        userId: string;
        checkedInAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
        location: string | null;
    }[]>;
    getCheckInStatus(userId: string): Promise<{
        lastCheckInAt: Date | null;
        hoursSinceLastCheckIn: number;
        nextCheckInDue: Date;
        isOverdue: boolean;
        streak: number;
        checkInFrequencyHours: number;
        gracePeriodHours: number;
    }>;
    private calculateStreak;
    private calculateNextCheckInDue;
    getUsersWithMissedCheckIns(): Promise<{
        email: string;
        fullName: string;
        id: string;
        checkInFrequencyHours: number;
        gracePeriodHours: number;
        lastCheckInAt: Date | null;
    }[]>;
    private getUserTopic;
}
