import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CheckInState, CheckInStatus, CheckIn, CheckInRecordedEvent } from '@/types/checkin';

const initialState: CheckInState = {
  status: null,
  history: [],
  loading: false,
  error: null,
};

const checkinSlice = createSlice({
  name: 'checkin',
  initialState,
  reducers: {
    // Record check-in
    recordCheckInRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    recordCheckInSuccess: (state, action: PayloadAction<{ streak: number; nextCheckInDue: Date }>) => {
      state.loading = false;
      if (state.status) {
        state.status.streak = action.payload.streak;
        state.status.nextCheckInDue = action.payload.nextCheckInDue;
        state.status.lastCheckInAt = new Date();
        state.status.isOverdue = false;
      }
    },
    recordCheckInFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get status
    getStatusRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getStatusSuccess: (state, action: PayloadAction<CheckInStatus>) => {
      state.status = action.payload;
      state.loading = false;
    },
    getStatusFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get history
    getHistoryRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getHistorySuccess: (state, action: PayloadAction<CheckIn[]>) => {
      state.history = action.payload;
      state.loading = false;
    },
    getHistoryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Socket event: check-in recorded
    checkInRecordedEvent: (state, action: PayloadAction<CheckInRecordedEvent>) => {
      if (state.status) {
        state.status.streak = action.payload.streak;
        state.status.nextCheckInDue = action.payload.nextCheckInDue;
        state.status.lastCheckInAt = action.payload.timestamp;
        state.status.isOverdue = action.payload.isOverdue;
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const checkinActions = checkinSlice.actions;
export default checkinSlice.reducer;
