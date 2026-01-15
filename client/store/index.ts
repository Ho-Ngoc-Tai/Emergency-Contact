import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './rootReducer';
import rootSaga from './rootSaga';
import { STORAGE_KEYS } from '@/utils/constants';

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

// Load initial state from localStorage
const loadState = () => {
  try {
    if (typeof window === 'undefined') return {};
    
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        auth: {
          user,
          token,
          loading: false,
          error: null,
        },
      };
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
  }
  return {};
};

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }).concat(sagaMiddleware),
  preloadedState: loadState(),
  devTools: process.env.NODE_ENV !== 'production',
});

// Run saga
sagaMiddleware.run(rootSaga);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
