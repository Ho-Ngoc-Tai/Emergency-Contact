'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { useEffect } from 'react';
import { socketService } from '@/services/socketService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkinActions } from '@/store/checkin/checkinSlice';
import { selectUser } from '@/store/auth/authSelectors';

function SocketListener() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  useEffect(() => {
    if (!user) return;

    // Listen for socket events
    socketService.onCheckInRecorded((data) => {
      dispatch(checkinActions.checkInRecordedEvent(data));
    });

    socketService.onAlertCancelled((data) => {
      console.log('Alert cancelled:', data);
    });

    return () => {
      socketService.offCheckInRecorded();
      socketService.offAlertCancelled();
    };
  }, [user, dispatch]);

  return null;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SocketListener />
      {children}
    </Provider>
  );
}
