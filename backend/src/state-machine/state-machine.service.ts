import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum CheckinState {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  PENDING_ALERT = 'PENDING_ALERT',
  TRIGGERED = 'TRIGGERED',
}

@Injectable()
export class StateMachineService {
  private readonly logger = new Logger(StateMachineService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate current state based on last check-in time
   */
  calculateState(
    lastCheckInAt: Date,
    timeoutHours: number = 24,
    warningThreshold: number = 1,
    gracePeriodMinutes: number = 10,
  ): CheckinState {
    const now = new Date();
    const hoursSinceCheckIn =
      (now.getTime() - lastCheckInAt.getTime()) / (1000 * 60 * 60);

    // SAFE: More than 1h before timeout
    if (hoursSinceCheckIn < timeoutHours - warningThreshold) {
      return CheckinState.SAFE;
    }

    // WARNING: Less than 1h before timeout
    if (hoursSinceCheckIn < timeoutHours) {
      return CheckinState.WARNING;
    }

    // Calculate minutes since timeout
    const minutesSinceTimeout = (hoursSinceCheckIn - timeoutHours) * 60;

    // PENDING_ALERT: Within grace period
    if (minutesSinceTimeout < gracePeriodMinutes) {
      return CheckinState.PENDING_ALERT;
    }

    // TRIGGERED: Grace period expired
    return CheckinState.TRIGGERED;
  }

  /**
   * Transition user to new state
   */
  async transitionState(
    userId: string,
    newState: CheckinState,
  ): Promise<void> {
    this.logger.log(`Transitioning user ${userId} to state: ${newState}`);

    const updateData: any = {
      checkinStatus: newState,
    };

    // Set alertTriggeredAt when entering TRIGGERED state
    if (newState === CheckinState.TRIGGERED) {
      updateData.alertTriggeredAt = new Date();
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  /**
   * Reset user to SAFE state (after check-in)
   */
  async resetToSafe(userId: string): Promise<void> {
    this.logger.log(`Resetting user ${userId} to SAFE state`);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        checkinStatus: CheckinState.SAFE,
        alertTriggeredAt: null,
      },
    });
  }

  /**
   * Get time remaining until next state transition
   */
  getTimeUntilNextState(
    lastCheckInAt: Date,
    currentState: CheckinState,
    timeoutHours: number = 24,
    warningThreshold: number = 1,
    gracePeriodMinutes: number = 10,
  ): { hours: number; minutes: number; seconds: number } {
    const now = new Date();
    const hoursSinceCheckIn =
      (now.getTime() - lastCheckInAt.getTime()) / (1000 * 60 * 60);

    let targetHours: number;

    switch (currentState) {
      case CheckinState.SAFE:
        targetHours = timeoutHours - warningThreshold;
        break;
      case CheckinState.WARNING:
        targetHours = timeoutHours;
        break;
      case CheckinState.PENDING_ALERT:
        targetHours = timeoutHours + gracePeriodMinutes / 60;
        break;
      default:
        return { hours: 0, minutes: 0, seconds: 0 };
    }

    const remainingMs =
      (targetHours - hoursSinceCheckIn) * 60 * 60 * 1000;

    if (remainingMs <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor(
      (remainingMs % (1000 * 60 * 60)) / (1000 * 60),
    );
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  }
}
