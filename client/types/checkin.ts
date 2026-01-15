// TypeScript types for check-in
export interface CheckIn {
  id: string;
  userId: string;
  checkedInAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface CheckInStatus {
  lastCheckInAt: Date | null;
  hoursSinceLastCheckIn: number;
  nextCheckInDue: Date;
  isOverdue: boolean;
  streak: number;
  checkInFrequencyHours: number;
  gracePeriodHours: number;
}

export interface CheckInRecordResponse {
  checkIn: CheckIn;
  streak: number;
  nextCheckInDue: Date;
}

export interface CheckInState {
  status: CheckInStatus | null;
  history: CheckIn[];
  loading: boolean;
  error: string | null;
}

// Socket event types
export interface CheckInRecordedEvent {
  checkInId: string;
  userId: string;
  timestamp: Date;
  streak: number;
  nextCheckInDue: Date;
  isOverdue: boolean;
}

export interface AlertCancelledEvent {
  userId: string;
  cancelledAlertCount: number;
  reason: string;
}
