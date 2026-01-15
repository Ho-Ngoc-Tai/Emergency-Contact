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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = exports.NotificationType = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
var NotificationType;
(function (NotificationType) {
    NotificationType["REMINDER"] = "REMINDER";
    NotificationType["WARNING"] = "WARNING";
    NotificationType["EMERGENCY"] = "EMERGENCY";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
let NotificationService = NotificationService_1 = class NotificationService {
    prisma;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async scheduleReminder(userId, scheduledAt) {
        await this.createNotification(userId, NotificationType.REMINDER, 'Nhắc nhở: Hãy điểm danh trong 2 giờ tới!', scheduledAt);
        this.logger.log(`Scheduled REMINDER for user ${userId} at ${scheduledAt}`);
    }
    async scheduleWarning(userId, scheduledAt) {
        await this.createNotification(userId, NotificationType.WARNING, 'Cảnh báo: Chỉ còn 1 giờ để điểm danh!', scheduledAt);
        this.logger.log(`Scheduled WARNING for user ${userId} at ${scheduledAt}`);
    }
    async scheduleEmergencyAlert(userId, scheduledAt) {
        await this.createNotification(userId, NotificationType.EMERGENCY, 'KHẨN CẤP: Còn 15 phút! Vui lòng điểm danh ngay!', scheduledAt);
        this.logger.log(`Scheduled EMERGENCY for user ${userId} at ${scheduledAt}`);
    }
    async cancelScheduledNotifications(userId) {
        await this.prisma.notificationQueue.deleteMany({
            where: {
                userId,
                status: 'PENDING',
            },
        });
        this.logger.log(`Cancelled all pending notifications for user ${userId}`);
    }
    async getPendingNotifications() {
        const now = new Date();
        return this.prisma.notificationQueue.findMany({
            where: {
                status: 'PENDING',
                scheduledAt: {
                    lte: now,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        fcmToken: true,
                        notificationsEnabled: true,
                    },
                },
            },
        });
    }
    async markAsSent(notificationId) {
        await this.prisma.notificationQueue.update({
            where: { id: notificationId },
            data: {
                status: 'SENT',
                sentAt: new Date(),
            },
        });
    }
    async markAsFailed(notificationId) {
        await this.prisma.notificationQueue.update({
            where: { id: notificationId },
            data: {
                status: 'FAILED',
            },
        });
    }
    async createNotification(userId, type, message, scheduledAt) {
        await this.prisma.notificationQueue.create({
            data: {
                userId,
                type,
                message,
                scheduledAt,
                status: 'PENDING',
            },
        });
    }
    async sendPushNotification(fcmToken, title, body) {
        this.logger.log(`[STUB] Sending push notification to ${fcmToken}: ${title} - ${body}`);
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notifications.service.js.map