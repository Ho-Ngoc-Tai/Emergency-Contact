import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_PATH } from '@/utils/constants';
import { CheckInRecordedEvent, AlertCancelledEvent } from '@/types/checkin';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.userId = userId;

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

    this.socket.emit(
      'subscribe',
      { topic: `user_${this.userId}`, type: 'private' },
      (response: { success: boolean; topic?: string; message?: string }) => {
        if (response.success) {
          console.log('✅ Subscribed to:', response.topic);
        } else {
          console.error('❌ Subscribe failed:', response.message);
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
    this.socket?.on('checkin:recorded', callback);
  }

  onAlertCancelled(callback: (data: AlertCancelledEvent) => void) {
    this.socket?.on('alert:cancelled', callback);
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
