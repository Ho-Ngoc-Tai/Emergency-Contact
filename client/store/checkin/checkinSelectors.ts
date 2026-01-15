import type { RootState } from '../index';

export const selectCheckin = (state: RootState) => state.checkin;
export const selectCheckinStatus = (state: RootState) => state.checkin.status;
export const selectCheckinHistory = (state: RootState) => state.checkin.history;
export const selectCheckinLoading = (state: RootState) => state.checkin.loading;
export const selectCheckinError = (state: RootState) => state.checkin.error;
export const selectStreak = (state: RootState) => state.checkin.status?.streak || 0;
export const selectIsOverdue = (state: RootState) => state.checkin.status?.isOverdue || false;
