import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import checkinReducer from './checkin/checkinSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  checkin: checkinReducer,
});

export default rootReducer;
