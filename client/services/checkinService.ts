import api from './api';
import {
  CheckInStatus,
  CheckIn,
  CheckInRecordResponse,
} from '@/types/checkin';

export const checkinService = {
  async recordCheckIn(): Promise<CheckInRecordResponse> {
    const response = await api.post<CheckInRecordResponse>('/checkin');
    return response.data;
  },

  async getStatus(): Promise<CheckInStatus> {
    const response = await api.get<CheckInStatus>('/checkin/status');
    return response.data;
  },

  async getHistory(limit = 30): Promise<CheckIn[]> {
    const response = await api.get<CheckIn[]>('/checkin/history', {
      params: { limit },
    });
    return response.data;
  },
};
