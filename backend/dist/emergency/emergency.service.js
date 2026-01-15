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
var EmergencyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmergencyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EmergencyService = EmergencyService_1 = class EmergencyService {
    prisma;
    logger = new common_1.Logger(EmergencyService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEmergencyContacts(userId) {
        return this.prisma.emergencyContact.findMany({
            where: { userId },
            orderBy: { priorityOrder: 'asc' },
        });
    }
    async triggerEmergencyCall(userId) {
        const contacts = await this.getEmergencyContacts(userId);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { fullName: true, lastKnownLocation: true },
        });
        if (!user) {
            this.logger.error(`User ${userId} not found`);
            return;
        }
        if (contacts.length === 0) {
            this.logger.warn(`No emergency contacts found for user ${userId}`);
            return;
        }
        this.logger.log(`Triggering emergency call for user ${userId}`);
        for (const contact of contacts) {
            if (contact.phoneNumber) {
                await this.makeEmergencyCall(contact.phoneNumber, user.fullName);
            }
            if (contact.email) {
                await this.sendEmergencyEmail(contact.email, user.fullName);
            }
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastEmergencyTrigger: new Date() },
        });
    }
    async makeEmergencyCall(phoneNumber, userName) {
        this.logger.log(`[STUB] Calling ${phoneNumber} for emergency: ${userName}`);
        const message = `Đây là thông báo tự động từ Emergency Contact. ` +
            `Người dùng ${userName} đã không tương tác với ứng dụng trong hơn 24 giờ. ` +
            `Vui lòng kiểm tra tình trạng của họ ngay lập tức.`;
    }
    async sendEmergencySMS(phoneNumber, userName, location) {
        const locationText = location ? `\nVị trí cuối: ${location}` : '';
        const message = `[KHẨN CẤP] ${userName} đã không điểm danh hơn 24h!${locationText}`;
        this.logger.log(`[STUB] Sending SMS to ${phoneNumber}: ${message}`);
    }
    async sendEmergencyEmail(email, userName) {
        this.logger.log(`[STUB] Sending emergency email to ${email} for ${userName}`);
    }
    async createAlert(userId) {
        const contacts = await this.getEmergencyContacts(userId);
        await this.prisma.alert.create({
            data: {
                userId,
                status: 'PENDING',
                contactsNotified: JSON.stringify(contacts.map(c => ({ name: c.name, phone: c.phoneNumber }))),
            },
        });
        this.logger.log(`Created alert for user ${userId}`);
    }
};
exports.EmergencyService = EmergencyService;
exports.EmergencyService = EmergencyService = EmergencyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmergencyService);
//# sourceMappingURL=emergency.service.js.map