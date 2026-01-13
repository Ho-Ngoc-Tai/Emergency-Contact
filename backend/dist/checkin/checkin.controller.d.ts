import { CheckinService } from './checkin.service';
export declare class CheckinController {
    private checkinService;
    constructor(checkinService: CheckinService);
    checkIn(req: any): Promise<{
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
        checkedInAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
        location: string | null;
        userId: string;
    }[]>;
}
