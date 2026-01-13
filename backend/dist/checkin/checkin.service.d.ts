import { PrismaService } from '../prisma/prisma.service';
export declare class CheckinService {
    private prisma;
    constructor(prisma: PrismaService);
    recordCheckIn(userId: string, ipAddress?: string, userAgent?: string): Promise<{
        checkIn: {
            id: string;
            checkedInAt: Date;
            ipAddress: string | null;
            userAgent: string | null;
            location: string | null;
            userId: string;
        };
        streak: number;
        nextCheckInDue: Date;
    }>;
    getCheckInHistory(userId: string, limit?: number): Promise<{
        id: string;
        checkedInAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
        location: string | null;
        userId: string;
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
}
