import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import {
  SubscribeDto,
  SubscribeResponseDto,
  UnsubscribeDto,
  UnsubscribeResponseDto,
} from './dto/socket.dto';

@WebSocketGateway({
  path: '/socket.io',
  cors: {
    origin: '*',
  },
  namespace: '/',
  transports: ['websocket'],
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  // Track client subscriptions: clientId -> Set<topic>
  private clientTopics: Map<string, Set<string>> = new Map();

  /**
   * Handle client connection
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Initialize empty topic set for this client
    this.clientTopics.set(client.id, new Set());
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Get all topics this client was subscribed to
    const topics = this.clientTopics.get(client.id);

    // Leave all rooms
    if (topics) {
      topics.forEach((topic) => {
        void client.leave(topic);
        this.logger.debug(`Client ${client.id} left room: ${topic}`);
      });
    }

    // Remove client from tracking
    this.clientTopics.delete(client.id);
  }

  /**
   * Handle subscribe event
   * Client sends: { topic: "mining_private", type: "private", params?: {...} }
   * Returns ACK: { success: true, topic: "mining_private" }
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscribeDto,
  ): SubscribeResponseDto {
    try {
      // Validate topic
      if (!payload.topic) {
        this.logger.warn(
          `Subscribe failed: missing topic from client ${client.id}`,
        );
        return {
          success: false,
          message: 'Topic is required',
        };
      }

      // Join the room
      void client.join(payload.topic);

      // Track subscription
      const topics = this.clientTopics.get(client.id);
      if (topics) {
        topics.add(payload.topic);
      }

      this.logger.log(
        `Client ${client.id} subscribed to topic: ${payload.topic} (type: ${payload.type})`,
      );

      return {
        success: true,
        topic: payload.topic,
        message: `Successfully subscribed to ${payload.topic}`,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Subscribe error: ${err.message}`, err.stack);
      return {
        success: false,
        message: 'Failed to subscribe',
      };
    }
  }

  /**
   * Handle unsubscribe event
   * Client sends: { topic: "mining_private" }
   * Returns ACK: { success: true }
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: UnsubscribeDto,
  ): UnsubscribeResponseDto {
    try {
      if (!payload.topic) {
        return {
          success: false,
          message: 'Topic is required',
        };
      }

      // Leave the room
      void client.leave(payload.topic);

      // Remove from tracking
      const topics = this.clientTopics.get(client.id);
      if (topics) {
        topics.delete(payload.topic);
      }

      this.logger.log(
        `Client ${client.id} unsubscribed from topic: ${payload.topic}`,
      );

      return {
        success: true,
        message: `Successfully unsubscribed from ${payload.topic}`,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Unsubscribe error: ${err.message}`, err.stack);
      return {
        success: false,
        message: 'Failed to unsubscribe',
      };
    }
  }

  // ============================================
  // Business Event Emission Methods
  // ============================================

  /**
   * Emit mining update to subscribed clients
   * Usage: eventsGateway.emitMiningUpdate('mining_private', { status: 'active', hashrate: 1000 })
   */
  emitMiningUpdate(topic: string, data: any) {
    this.server.to(topic).emit('mining:update', data);
    this.logger.debug(`Emitted mining:update to room ${topic}`);
  }

  /**
   * Emit order payment status to subscribed clients
   * Usage: eventsGateway.emitOrderPaymentStatus('order_private', { orderId: '123', status: 'paid' })
   */
  emitOrderPaymentStatus(topic: string, data: any) {
    this.server.to(topic).emit('order:payment:status', data);
    this.logger.debug(`Emitted order:payment:status to room ${topic}`);
  }

  /**
   * Emit notification count to subscribed clients
   * Usage: eventsGateway.emitNotificationCount('notifications_private', { count: 5 })
   */
  emitNotificationCount(topic: string, data: any) {
    this.server.to(topic).emit('notification:count', data);
    this.logger.debug(`Emitted notification:count to room ${topic}`);
  }

  /**
   * Generic emit method for custom events
   * Usage: eventsGateway.emitToRoom('custom_topic', 'custom:event', { data })
   */
  emitToRoom(topic: string, event: string, data: any) {
    this.server.to(topic).emit(event, data);
    this.logger.debug(`Emitted ${event} to room ${topic}`);
  }

  /**
   * Get all connected clients count
   */
  getConnectedClientsCount(): number {
    return this.server.sockets.sockets.size;
  }

  /**
   * Get topics for a specific client
   */
  getClientTopics(clientId: string): Set<string> | undefined {
    return this.clientTopics.get(clientId);
  }
}
