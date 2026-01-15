import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SubscribeDto, SubscribeResponseDto, UnsubscribeDto, UnsubscribeResponseDto } from './dto/socket.dto';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    private clientTopics;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribe(client: Socket, payload: SubscribeDto): SubscribeResponseDto;
    handleUnsubscribe(client: Socket, payload: UnsubscribeDto): UnsubscribeResponseDto;
    emitMiningUpdate(topic: string, data: any): void;
    emitOrderPaymentStatus(topic: string, data: any): void;
    emitNotificationCount(topic: string, data: any): void;
    emitToRoom(topic: string, event: string, data: any): void;
    getConnectedClientsCount(): number;
    getClientTopics(clientId: string): Set<string> | undefined;
}
