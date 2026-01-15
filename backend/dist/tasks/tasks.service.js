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
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const emergency_service_1 = require("../emergency/emergency.service");
let TasksService = TasksService_1 = class TasksService {
    prisma;
    notificationService;
    emergencyService;
    logger = new common_1.Logger(TasksService_1.name);
    constructor(prisma, notificationService, emergencyService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
        this.emergencyService = emergencyService;
    }
    async checkOverdueCheckIns() {
        this.logger.log('Running overdue check-ins check...');
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const overdueUsers = await this.prisma.user.findMany({
            where: {
                isActive: true,
                emergencyCallEnabled: true,
                subscriptionActive: true,
                OR: [
                    { lastCheckInAt: { lt: twentyFourHoursAgo } },
                    { lastCheckInAt: null },
                ],
            },
            select: {
                id: true,
                fullName: true,
                lastCheckInAt: true,
                lastEmergencyTrigger: true,
            },
        });
        this.logger.log(`Found ${overdueUsers.length} overdue users`);
        for (const user of overdueUsers) {
            if (user.lastEmergencyTrigger &&
                now.getTime() - user.lastEmergencyTrigger.getTime() < 60 * 60 * 1000) {
                continue;
            }
            this.logger.warn(`Triggering emergency for user ${user.id} (${user.fullName})`);
            await this.emergencyService.createAlert(user.id);
            await this.emergencyService.triggerEmergencyCall(user.id);
        }
    }
    async processPendingNotifications() {
        const notifications = await this.notificationService.getPendingNotifications();
        if (notifications.length === 0)
            return;
        this.logger.log(`Processing ${notifications.length} pending notifications`);
        for (const notification of notifications) {
            try {
                if (!notification.user.notificationsEnabled) {
                    await this.notificationService.markAsFailed(notification.id);
                    continue;
                }
                if (notification.user.fcmToken) {
                    await this.notificationService.sendPushNotification(notification.user.fcmToken, 'Nhắc nhở điểm danh', notification.message);
                    await this.notificationService.markAsSent(notification.id);
                }
                else {
                    this.logger.warn(`User ${notification.userId} has no FCM token`);
                    await this.notificationService.markAsFailed(notification.id);
                }
            }
            catch (error) {
                this.logger.error(`Failed to send notification ${notification.id}:`, error);
                await this.notificationService.markAsFailed(notification.id);
            }
        }
    }
    async cleanupOldNotifications() {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const result = await this.prisma.notificationQueue.deleteMany({
            where: {
                createdAt: { lt: sevenDaysAgo },
            },
        });
        this.logger.log(`Cleaned up ${result.count} old notifications`);
    }
};
exports.TasksService = TasksService;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "checkOverdueCheckIns", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "processPendingNotifications", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "cleanupOldNotifications", null);
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationService,
        emergency_service_1.EmergencyService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map