import { all } from 'redux-saga/effects';
import { authSaga } from './auth/authSaga';
import { checkinSaga } from './checkin/checkinSaga';

export default function* rootSaga() {
  yield all([
    authSaga(),
    checkinSaga(),
  ]);
}
