import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { authActions } from './authSlice';
import { authService } from '@/services/authService';
import { socketService } from '@/services/socketService';
import { LoginCredentials, RegisterData, AuthResponse } from '@/types/auth';
import { STORAGE_KEYS } from '@/utils/constants';

// Login saga
function* loginSaga(action: PayloadAction<LoginCredentials>) {
  try {
    console.log('🔐 Login attempt:', action.payload.email);
    const response: AuthResponse = yield call(authService.login, action.payload);
    
    console.log('✅ Login response:', response);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      console.log('💾 Token saved to localStorage');
    }

    yield put(authActions.loginSuccess(response));
    console.log('✅ Login success action dispatched');

    // Connect socket
    socketService.connect(response.user.id);
    console.log('🔌 Socket connecting for user:', response.user.id);

    // Redirect to dashboard
    console.log('🔄 Redirecting to dashboard...');
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login failed';
    yield put(authActions.loginFailure(errorMessage));
  }
}

// Register saga
function* registerSaga(action: PayloadAction<RegisterData>) {
  try {
    const response: AuthResponse = yield call(authService.register, action.payload);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    }

    yield put(authActions.registerSuccess(response));

    // Connect socket
    socketService.connect(response.user.id);

    // Redirect to dashboard
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registration failed';
    yield put(authActions.registerFailure(errorMessage));
  }
}

// Logout saga
function* logoutSaga() {
  authService.logout();
  socketService.disconnect();
  
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

// Root auth saga
export function* authSaga() {
  yield takeLatest(authActions.loginRequest.type, loginSaga);
  yield takeLatest(authActions.registerRequest.type, registerSaga);
  yield takeLatest(authActions.logoutRequest.type, logoutSaga);
}
