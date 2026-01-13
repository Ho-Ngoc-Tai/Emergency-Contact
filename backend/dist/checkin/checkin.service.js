"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckinService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CheckinService = class CheckinService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordCheckIn(userId, ipAddress, userAgent) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                lastCheckInAt: new Date(),
            },
        });
        const checkIn = await this.prisma.checkIn.create({
            data: {
                userId,
                ipAddress,
                userAgent,
            },
        });
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
        const streak = await this.calculateStreak(userId);
        return {
            checkIn,
            streak,
            nextCheckInDue: this.calculateNextCheckInDue(user.checkInFrequencyHours, user.gracePeriodHours),
        };
    }
    async getCheckInHistory(userId, limit = 30) {
        const checkIns = await this.prisma.checkIn.findMany({
            where: { userId },
            orderBy: { checkedInAt: 'desc' },
            take: limit,
        });
        return checkIns;
    }
    async getCheckInStatus(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                lastCheckInAt: true,
                checkInFrequencyHours: true,
                gracePeriodHours: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const streak = await this.calculateStreak(userId);
        const nextCheckInDue = this.calculateNextCheckInDue(user.checkInFrequencyHours, user.gracePeriodHours);
        const now = new Date();
        const lastCheckIn = user.lastCheckInAt || new Date(0);
        const hoursSinceLastCheckIn = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);
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
    async calculateStreak(userId) {
        const checkIns = await this.prisma.checkIn.findMany({
            where: { userId },
            orderBy: { checkedInAt: 'desc' },
            select: { checkedInAt: true },
        });
        if (checkIns.length === 0)
            return 0;
        let streak = 1;
        const oneDayMs = 24 * 60 * 60 * 1000;
        for (let i = 0; i < checkIns.length - 1; i++) {
            const current = new Date(checkIns[i].checkedInAt).setHours(0, 0, 0, 0);
            const next = new Date(checkIns[i + 1].checkedInAt).setHours(0, 0, 0, 0);
            const diff = current - next;
            if (diff <= oneDayMs * 2) {
                streak++;
            }
            else {
                break;
            }
        }
        return streak;
    }
    calculateNextCheckInDue(checkInFrequencyHours, gracePeriodHours) {
        const now = new Date();
        const totalHours = checkInFrequencyHours + gracePeriodHours;
        return new Date(now.getTime() + totalHours * 60 * 60 * 1000);
    }
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
                return false;
            }
            const hoursSinceLastCheckIn = (now.getTime() - user.lastCheckInAt.getTime()) / (1000 * 60 * 60);
            return hoursSinceLastCheckIn >
                (user.checkInFrequencyHours + user.gracePeriodHours);
        });
        return missedUsers;
    }
};
exports.CheckinService = CheckinService;
exports.CheckinService = CheckinService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CheckinService);
//# sourceMappingURL=checkin.service.js.map