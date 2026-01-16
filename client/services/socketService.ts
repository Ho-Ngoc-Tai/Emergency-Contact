import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_PATH } from '@/utils/constants';
import { CheckInRecordedEvent, AlertCancelledEvent } from '@/types/checkin';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string) {
    if (this.socket?.connected) {
      console.log('🔌 Socket already connected');
      return;
    }

    this.userId = userId;
    console.log('🔌 [SOCKET] Connecting...', { userId, url: SOCKET_URL, path: SOCKET_PATH });

    this.socket = io(SOCKET_URL, {
      path: SOCKET_PATH,
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.subscribeToUserTopic();
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  private subscribeToUserTopic() {
    if (!this.socket || !this.userId) return;

    const topic = `user_${this.userId}`;
    console.log('📡 [SOCKET] Subscribing to topic:', topic);

    this.socket.emit(
      'subscribe',
      { topic, type: 'private' },
      (response: { success: boolean; topic?: string; message?: string }) => {
        if (response.success) {
          console.log('✅ [SOCKET] Subscribed to:', response.topic);
        } else {
          console.error('❌ [SOCKET] Subscribe failed:', response.message);
        }
      }
    );
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  // Event listeners
  onCheckInRecorded(callback: (data: CheckInRecordedEvent) => void) {
    console.log('👂 [SOCKET] Listening for checkin:recorded events');
    this.socket?.on('checkin:recorded', (data) => {
      console.log('🎉 [SOCKET] Event received: checkin:recorded', data);
      callback(data);
    });
  }

  onAlertCancelled(callback: (data: AlertCancelledEvent) => void) {
    console.log('👂 [SOCKET] Listening for alert:cancelled events');
    this.socket?.on('alert:cancelled', (data) => {
      console.log('🎉 [SOCKET] Event received: alert:cancelled', data);
      callback(data);
    });
  }

  // Remove listeners
  offCheckInRecorded() {
    this.socket?.off('checkin:recorded');
  }

  offAlertCancelled() {
    this.socket?.off('alert:cancelled');
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
