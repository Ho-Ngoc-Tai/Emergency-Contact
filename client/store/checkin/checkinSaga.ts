import { call, put, takeLatest } from 'redux-saga/effects';
import { checkinActions } from './checkinSlice';
import { checkinService } from '@/services/checkinService';
import { CheckInRecordResponse, CheckInStatus, CheckIn } from '@/types/checkin';

// Record check-in saga
function* recordCheckInSaga() {
  try {
    const response: CheckInRecordResponse = yield call(checkinService.recordCheckIn);
    yield put(checkinActions.recordCheckInSuccess({
      streak: response.streak,
      nextCheckInDue: response.nextCheckInDue,
    }));
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Check-in failed';
    yield put(checkinActions.recordCheckInFailure(errorMessage));
  }
}

// Get status saga
function* getStatusSaga() {
  try {
    const status: CheckInStatus = yield call(checkinService.getStatus);
    yield put(checkinActions.getStatusSuccess(status));
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to get status';
    yield put(checkinActions.getStatusFailure(errorMessage));
  }
}

// Get history saga
function* getHistorySaga() {
  try {
    const history: CheckIn[] = yield call(checkinService.getHistory);
    yield put(checkinActions.getHistorySuccess(history));
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to get history';
    yield put(checkinActions.getHistoryFailure(errorMessage));
  }
}

// Root checkin saga
export function* checkinSaga() {
  yield takeLatest(checkinActions.recordCheckInRequest.type, recordCheckInSaga);
  yield takeLatest(checkinActions.getStatusRequest.type, getStatusSaga);
  yield takeLatest(checkinActions.getHistoryRequest.type, getHistorySaga);
}
