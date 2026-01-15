# Socket.IO Gateway Usage Examples

## Overview

The Socket.IO Gateway is now integrated into the backend. This document provides examples of how to use it from both the frontend (client) and backend (server) sides.

## Frontend Usage (Client)

### 1. Connect to Socket.IO Server

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  path: '/socket.io',
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

### 2. Subscribe to Topics

```javascript
// Subscribe to mining updates
socket.emit('subscribe', 
  { topic: 'mining_private', type: 'private' },
  (response) => {
    console.log('Subscribe response:', response);
    // { success: true, topic: 'mining_private', message: '...' }
  }
);

// Subscribe to order updates
socket.emit('subscribe',
  { topic: 'order_private', type: 'private' },
  (response) => {
    console.log('Subscribe response:', response);
  }
);

// Subscribe to notifications
socket.emit('subscribe',
  { topic: 'notifications_private', type: 'private' },
  (response) => {
    console.log('Subscribe response:', response);
  }
);
```

### 3. Listen to Business Events

```javascript
// Listen for mining updates
socket.on('mining:update', (data) => {
  console.log('Mining update:', data);
  // { status: 'active', hashrate: 1000, ... }
});

// Listen for order payment status
socket.on('order:payment:status', (data) => {
  console.log('Order payment status:', data);
  // { orderId: '123', status: 'paid', ... }
});

// Listen for notification count
socket.on('notification:count', (data) => {
  console.log('Notification count:', data);
  // { count: 5 }
});
```

### 4. Unsubscribe from Topics

```javascript
socket.emit('unsubscribe',
  { topic: 'mining_private' },
  (response) => {
    console.log('Unsubscribe response:', response);
    // { success: true, message: '...' }
  }
);
```

---

## Backend Usage (Server)

### 1. Inject EventsGateway into a Service

```typescript
import { Injectable } from '@nestjs/common';
import { EventsGateway } from '../gateways/events.gateway';

@Injectable()
export class MiningService {
  constructor(private eventsGateway: EventsGateway) {}

  async updateMiningStatus(userId: string, status: any) {
    // Your business logic here
    
    // Emit realtime update to subscribed clients
    const topic = `mining_private`; // or `mining_${userId}` for user-specific
    this.eventsGateway.emitMiningUpdate(topic, {
      status: 'active',
      hashrate: 1000,
      timestamp: new Date(),
    });
  }
}
```

### 2. Example: CheckIn Service with Realtime Updates

```typescript
import { Injectable } from '@nestjs/common';
import { EventsGateway } from '../gateways/events.gateway';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CheckinService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async recordCheckIn(userId: string) {
    // Record check-in
    const checkIn = await this.prisma.checkIn.create({
      data: { userId, checkedInAt: new Date() },
    });

    // Emit realtime notification
    this.eventsGateway.emitToRoom(
      `user_${userId}`,
      'checkin:recorded',
      {
        checkInId: checkIn.id,
        timestamp: checkIn.checkedInAt,
        message: 'Check-in recorded successfully',
      }
    );

    return checkIn;
  }
}
```

### 3. Example: Alert Service with Notifications

```typescript
import { Injectable } from '@nestjs/common';
import { EventsGateway } from '../gateways/events.gateway';

@Injectable()
export class AlertService {
  constructor(private eventsGateway: EventsGateway) {}

  async triggerAlert(userId: string) {
    // Create alert in database
    const alert = await this.createAlert(userId);

    // Notify user in realtime
    this.eventsGateway.emitNotificationCount(
      `notifications_private`,
      {
        count: 1,
        alert: {
          id: alert.id,
          message: 'You missed your check-in!',
          severity: 'high',
        },
      }
    );
  }
}
```

### 4. Custom Events

```typescript
// Emit custom events to specific rooms
this.eventsGateway.emitToRoom(
  'custom_topic',
  'custom:event:name',
  { your: 'data' }
);
```

---

## Topic Naming Conventions

### Recommended Patterns:

1. **Private user-specific topics:**
   - `user_${userId}` - for user-specific updates
   - `notifications_${userId}` - for user notifications

2. **Global topics:**
   - `mining_private` - for all mining updates
   - `order_private` - for all order updates
   - `notifications_private` - for global notifications

3. **Feature-specific topics:**
   - `checkin_${userId}` - for check-in updates
   - `alert_${userId}` - for alert notifications

---

## Testing the Gateway

### Using Socket.IO Client (Browser Console)

```javascript
// In browser console
const socket = io('http://localhost:3001', {
  path: '/socket.io',
  transports: ['websocket']
});

socket.on('connect', () => console.log('Connected'));

socket.emit('subscribe', 
  { topic: 'test_topic', type: 'private' },
  (res) => console.log(res)
);

socket.on('mining:update', (data) => console.log('Received:', data));
```

### Using Postman or Socket.IO Testing Tools

1. Connect to `ws://localhost:3001/socket.io`
2. Send `subscribe` event with payload: `{ "topic": "test_topic", "type": "private" }`
3. Listen for ACK response
4. Listen for business events

---

## Important Notes

- **Event names are case-sensitive:** `mining:update` ≠ `Mining:Update`
- **Topics are room names:** Clients must subscribe before receiving events
- **ACK callbacks:** Always handle the acknowledgment response
- **Connection lifecycle:** Clean up subscriptions on disconnect (handled automatically)
- **In-memory storage:** Current implementation uses Map (no Redis yet)

---

## Next Steps

For production deployment, consider:

1. **Redis Adapter** - for horizontal scaling across multiple servers
2. **Authentication** - validate JWT tokens on socket connection
3. **Rate Limiting** - prevent subscription spam
4. **Monitoring** - track connected clients and room sizes
