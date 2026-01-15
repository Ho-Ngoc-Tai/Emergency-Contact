import { CheckinService } from './checkin.service';
export declare class CheckinController {
    private checkinService;
    constructor(checkinService: CheckinService);
    checkIn(req: any): Promise<{
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
    getStatus(req: any): Promise<{
        lastCheckInAt: Date | null;
        hoursSinceLastCheckIn: number;
        nextCheckInDue: Date;
        isOverdue: boolean;
        streak: number;
        checkInFrequencyHours: number;
        gracePeriodHours: number;
    }>;
    getHistory(req: any, limit?: string): Promise<{
        id: string;
        userId: string;
        checkedInAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
        location: string | null;
    }[]>;
}
