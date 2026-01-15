import { PrismaService } from '../prisma/prisma.service';
export declare enum CheckinState {
    SAFE = "SAFE",
    WARNING = "WARNING",
    PENDING_ALERT = "PENDING_ALERT",
    TRIGGERED = "TRIGGERED"
}
export declare class StateMachineService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculateState(lastCheckInAt: Date, timeoutHours?: number, warningThreshold?: number, gracePeriodMinutes?: number): CheckinState;
    transitionState(userId: string, newState: CheckinState): Promise<void>;
    resetToSafe(userId: string): Promise<void>;
    getTimeUntilNextState(lastCheckInAt: Date, currentState: CheckinState, timeoutHours?: number, warningThreshold?: number, gracePeriodMinutes?: number): {
        hours: number;
        minutes: number;
        seconds: number;
    };
}
