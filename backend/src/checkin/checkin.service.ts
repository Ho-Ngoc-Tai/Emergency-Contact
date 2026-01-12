import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CheckinService {
    constructor(private prisma: PrismaService) { }

    /**
     * Record a check-in for the user
     */
    async recordCheckIn(userId: string, ipAddress?: string, userAgent?: string) {
        // Update user's last check-in time
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                lastCheckInAt: new Date(),
            },
        });

        // Create check-in record
        const checkIn = await this.prisma.checkIn.create({
            data: {
                userId,
                ipAddress,
                userAgent,
            },
        });

        // Cancel any pending alerts for this user
        await this.prisma.alert.updateMany({
            where: {
                userId,
                status: 'PENDING',
            },
            data: {
                status: 'CANCELLED',
                resolvedAt: new Date(),
                resolutionNote: 'User checked in',
            },
        });

        // Calculate streak
        const streak = await this.calculateStreak(userId);

        return {
            checkIn,
            streak,
            nextCheckInDue: this.calculateNextCheckInDue(
                user.checkInFrequencyHours,
                user.gracePeriodHours,
            ),
        };
    }

    /**
     * Get check-in history for a user
     */
    async getCheckInHistory(userId: string, limit = 30) {
        const checkIns = await this.prisma.checkIn.findMany({
            where: { userId },
            orderBy: { checkedInAt: 'desc' },
            take: limit,
        });

        return checkIns;
    }

    /**
     * Get user's current check-in status
     */
    async getCheckInStatus(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                lastCheckInAt: true,
                checkInFrequencyHours: true,
                gracePeriodHours: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const streak = await this.calculateStreak(userId);
        const nextCheckInDue = this.calculateNextCheckInDue(
            user.checkInFrequencyHours,
            user.gracePeriodHours,
        );

        const now = new Date();
        const lastCheckIn = user.lastCheckInAt || new Date(0);
        const hoursSinceLastCheckIn =
            (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);

        const isOverdue = hoursSinceLastCheckIn >
            (user.checkInFrequencyHours + user.gracePeriodHours);

        return {
            lastCheckInAt: user.lastCheckInAt,
            hoursSinceLastCheckIn: Math.floor(hoursSinceLastCheckIn),
            nextCheckInDue,
            isOverdue,
            streak,
            checkInFrequencyHours: user.checkInFrequencyHours,
            gracePeriodHours: user.gracePeriodHours,
        };
    }

    /**
     * Calculate user's check-in streak (consecutive days)
     */
    private async calculateStreak(userId: string): Promise<number> {
        const checkIns = await this.prisma.checkIn.findMany({
            where: { userId },
            orderBy: { checkedInAt: 'desc' },
            select: { checkedInAt: true },
        });

        if (checkIns.length === 0) return 0;

        let streak = 1;
        const oneDayMs = 24 * 60 * 60 * 1000;

        for (let i = 0; i < checkIns.length - 1; i++) {
            const current = new Date(checkIns[i].checkedInAt).setHours(0, 0, 0, 0);
            const next = new Date(checkIns[i + 1].checkedInAt).setHours(0, 0, 0, 0);
            const diff = current - next;

            // If check-ins are consecutive days
            if (diff <= oneDayMs * 2) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * Calculate when the next check-in is due
     */
    private calculateNextCheckInDue(
        checkInFrequencyHours: number,
        gracePeriodHours: number,
    ): Date {
        const now = new Date();
        const totalHours = checkInFrequencyHours + gracePeriodHours;
        return new Date(now.getTime() + totalHours * 60 * 60 * 1000);
    }

    /**
     * Get users who have missed their check-in (for cron job)
     */
    async getUsersWithMissedCheckIns() {
        const users = await this.prisma.user.findMany({
            where: {
                isActive: true,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                lastCheckInAt: true,
                checkInFrequencyHours: true,
                gracePeriodHours: true,
            },
        });

        const now = new Date();
        const missedUsers = users.filter((user) => {
            if (!user.lastCheckInAt) {
                // If never checked in, check if account is older than frequency + grace period
                return false;
            }

            const hoursSinceLastCheckIn =
                (now.getTime() - user.lastCheckInAt.getTime()) / (1000 * 60 * 60);

            return hoursSinceLastCheckIn >
                (user.checkInFrequencyHours + user.gracePeriodHours);
        });

        return missedUsers;
    }
}
