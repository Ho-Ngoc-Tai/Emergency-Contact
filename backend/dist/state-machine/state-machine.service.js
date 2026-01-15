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
var StateMachineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateMachineService = exports.CheckinState = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
var CheckinState;
(function (CheckinState) {
    CheckinState["SAFE"] = "SAFE";
    CheckinState["WARNING"] = "WARNING";
    CheckinState["PENDING_ALERT"] = "PENDING_ALERT";
    CheckinState["TRIGGERED"] = "TRIGGERED";
})(CheckinState || (exports.CheckinState = CheckinState = {}));
let StateMachineService = StateMachineService_1 = class StateMachineService {
    prisma;
    logger = new common_1.Logger(StateMachineService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    calculateState(lastCheckInAt, timeoutHours = 24, warningThreshold = 1, gracePeriodMinutes = 10) {
        const now = new Date();
        const hoursSinceCheckIn = (now.getTime() - lastCheckInAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceCheckIn < timeoutHours - warningThreshold) {
            return CheckinState.SAFE;
        }
        if (hoursSinceCheckIn < timeoutHours) {
            return CheckinState.WARNING;
        }
        const minutesSinceTimeout = (hoursSinceCheckIn - timeoutHours) * 60;
        if (minutesSinceTimeout < gracePeriodMinutes) {
            return CheckinState.PENDING_ALERT;
        }
        return CheckinState.TRIGGERED;
    }
    async transitionState(userId, newState) {
        this.logger.log(`Transitioning user ${userId} to state: ${newState}`);
        const updateData = {
            checkinStatus: newState,
        };
        if (newState === CheckinState.TRIGGERED) {
            updateData.alertTriggeredAt = new Date();
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
    }
    async resetToSafe(userId) {
        this.logger.log(`Resetting user ${userId} to SAFE state`);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                checkinStatus: CheckinState.SAFE,
                alertTriggeredAt: null,
            },
        });
    }
    getTimeUntilNextState(lastCheckInAt, currentState, timeoutHours = 24, warningThreshold = 1, gracePeriodMinutes = 10) {
        const now = new Date();
        const hoursSinceCheckIn = (now.getTime() - lastCheckInAt.getTime()) / (1000 * 60 * 60);
        let targetHours;
        switch (currentState) {
            case CheckinState.SAFE:
                targetHours = timeoutHours - warningThreshold;
                break;
            case CheckinState.WARNING:
                targetHours = timeoutHours;
                break;
            case CheckinState.PENDING_ALERT:
                targetHours = timeoutHours + gracePeriodMinutes / 60;
                break;
            default:
                return { hours: 0, minutes: 0, seconds: 0 };
        }
        const remainingMs = (targetHours - hoursSinceCheckIn) * 60 * 60 * 1000;
        if (remainingMs <= 0) {
            return { hours: 0, minutes: 0, seconds: 0 };
        }
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
        return { hours, minutes, seconds };
    }
};
exports.StateMachineService = StateMachineService;
exports.StateMachineService = StateMachineService = StateMachineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StateMachineService);
//# sourceMappingURL=state-machine.service.js.map