import { PrismaService } from '../prisma/prisma.service';
export declare class EmergencyService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getEmergencyContacts(userId: string): Promise<{
        email: string | null;
        phoneNumber: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        relationship: string | null;
        priorityOrder: number;
        notificationMethod: string;
    }[]>;
    triggerEmergencyCall(userId: string): Promise<void>;
    private makeEmergencyCall;
    sendEmergencySMS(phoneNumber: string, userName: string, location?: string): Promise<void>;
    private sendEmergencyEmail;
    createAlert(userId: string): Promise<void>;
}
