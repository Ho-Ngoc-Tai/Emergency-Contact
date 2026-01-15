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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EventsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const socket_dto_1 = require("./dto/socket.dto");
let EventsGateway = EventsGateway_1 = class EventsGateway {
    server;
    logger = new common_1.Logger(EventsGateway_1.name);
    clientTopics = new Map();
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        this.clientTopics.set(client.id, new Set());
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        const topics = this.clientTopics.get(client.id);
        if (topics) {
            topics.forEach((topic) => {
                void client.leave(topic);
                this.logger.debug(`Client ${client.id} left room: ${topic}`);
            });
        }
        this.clientTopics.delete(client.id);
    }
    handleSubscribe(client, payload) {
        try {
            if (!payload.topic) {
                this.logger.warn(`Subscribe failed: missing topic from client ${client.id}`);
                return {
                    success: false,
                    message: 'Topic is required',
                };
            }
            void client.join(payload.topic);
            const topics = this.clientTopics.get(client.id);
            if (topics) {
                topics.add(payload.topic);
            }
            this.logger.log(`Client ${client.id} subscribed to topic: ${payload.topic} (type: ${payload.type})`);
            return {
                success: true,
                topic: payload.topic,
                message: `Successfully subscribed to ${payload.topic}`,
            };
        }
        catch (error) {
            const err = error;
            this.logger.error(`Subscribe error: ${err.message}`, err.stack);
            return {
                success: false,
                message: 'Failed to subscribe',
            };
        }
    }
    handleUnsubscribe(client, payload) {
        try {
            if (!payload.topic) {
                return {
                    success: false,
                    message: 'Topic is required',
                };
            }
            void client.leave(payload.topic);
            const topics = this.clientTopics.get(client.id);
            if (topics) {
                topics.delete(payload.topic);
            }
            this.logger.log(`Client ${client.id} unsubscribed from topic: ${payload.topic}`);
            return {
                success: true,
                message: `Successfully unsubscribed from ${payload.topic}`,
            };
        }
        catch (error) {
            const err = error;
            this.logger.error(`Unsubscribe error: ${err.message}`, err.stack);
            return {
                success: false,
                message: 'Failed to unsubscribe',
            };
        }
    }
    emitMiningUpdate(topic, data) {
        this.server.to(topic).emit('mining:update', data);
        this.logger.debug(`Emitted mining:update to room ${topic}`);
    }
    emitOrderPaymentStatus(topic, data) {
        this.server.to(topic).emit('order:payment:status', data);
        this.logger.debug(`Emitted order:payment:status to room ${topic}`);
    }
    emitNotificationCount(topic, data) {
        this.server.to(topic).emit('notification:count', data);
        this.logger.debug(`Emitted notification:count to room ${topic}`);
    }
    emitToRoom(topic, event, data) {
        this.server.to(topic).emit(event, data);
        this.logger.debug(`Emitted ${event} to room ${topic}`);
    }
    getConnectedClientsCount() {
        return this.server.sockets.sockets.size;
    }
    getClientTopics(clientId) {
        return this.clientTopics.get(clientId);
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        socket_dto_1.SubscribeDto]),
    __metadata("design:returntype", socket_dto_1.SubscribeResponseDto)
], EventsGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        socket_dto_1.UnsubscribeDto]),
    __metadata("design:returntype", socket_dto_1.UnsubscribeResponseDto)
], EventsGateway.prototype, "handleUnsubscribe", null);
exports.EventsGateway = EventsGateway = EventsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        path: '/socket.io',
        cors: {
            origin: '*',
        },
        namespace: '/',
        transports: ['websocket'],
    })
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map