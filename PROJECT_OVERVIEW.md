# LifeSignal - Dead Man's Switch Application

## 🎯 Mục tiêu
Ứng dụng giúp người dùng thiết lập cơ chế báo động tự động khi họ không check-in trong một khoảng thời gian nhất định, nhằm đảm bảo an toàn và kết nối với người thân.

## 🏗️ Kiến trúc hệ thống

### Frontend (Next.js 14+)
- **Framework**: Next.js với App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Authentication**: NextAuth.js
- **State Management**: React Context / Zustand
- **UI Components**: Shadcn/ui

### Backend (NestJS)
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis
- **Queue**: Bull/BullMQ
- **Authentication**: JWT + Passport

### Third-party Services
- **SMS**: Twilio
- **Email**: SendGrid / Resend
- **Payment**: Stripe
- **Hosting**: Vercel (Frontend) + Railway (Backend)

## 📊 Database Schema

### Users
```sql
- id (UUID, PK)
- email (unique)
- password_hash
- phone_number
- full_name
- check_in_frequency (hours, default: 24)
- grace_period_hours (default: 2)
- last_check_in_at (timestamp)
- subscription_status (free/premium/expired)
- is_active (boolean)
- created_at
- updated_at
```

### Emergency Contacts
```sql
- id (UUID, PK)
- user_id (FK → users)
- name
- phone_number
- email
- relationship
- priority_order (1, 2, 3...)
- notification_method (sms/email/both)
- created_at
```

### Check-ins
```sql
- id (UUID, PK)
- user_id (FK → users)
- checked_in_at (timestamp)
- ip_address
- user_agent
- location (optional, JSON)
```

### Alerts
```sql
- id (UUID, PK)
- user_id (FK → users)
- triggered_at (timestamp)
- status (pending/sent/resolved/cancelled)
- contacts_notified (JSON array)
- resolved_at (timestamp, nullable)
- resolution_note (text, nullable)
```

### Subscriptions
```sql
- id (UUID, PK)
- user_id (FK → users)
- plan_type (free/premium)
- status (active/cancelled/expired)
- started_at
- expires_at
- stripe_subscription_id
- amount
```

## 🔄 Core Flow

### 1. Daily Check-in Flow
```
User opens app 
  → Clicks "I'm Still OK" button
  → Backend records check-in
  → Updates last_check_in_at
  → Cancels any pending alerts
  → Shows success message + streak
```

### 2. Missed Check-in Flow
```
Cron job runs every hour
  → Query users where (last_check_in_at + check_in_frequency + grace_period) < NOW
  → For each user:
      → Create alert record
      → Get emergency contacts (sorted by priority)
      → Send notifications (SMS/Email)
      → Log notification results
```

### 3. Alert Resolution Flow
```
User checks in after alert
  → Alert status → resolved
  → Send "All Clear" message to contacts
  
OR

Emergency contact responds
  → Alert marked as acknowledged
  → User receives notification
```

## 🎨 UI Pages

1. **Landing Page** (`/`)
   - Hero section
   - How it works
   - Pricing
   - Testimonials

2. **Auth Pages** (`/auth/login`, `/auth/register`)
   - Login form
   - Register form
   - Password reset

3. **Dashboard** (`/dashboard`)
   - Large check-in button
   - Countdown timer
   - Streak counter
   - Recent activity

4. **Emergency Contacts** (`/contacts`)
   - Contact list
   - Add/Edit forms
   - Test notification button

5. **Settings** (`/settings`)
   - Check-in frequency
   - Grace period
   - Notification preferences
   - Account settings

6. **Subscription** (`/subscription`)
   - Current plan
   - Upgrade options
   - Payment history

## 🚀 Development Phases

### Phase 1: Setup (Current)
- [x] Project structure
- [ ] Next.js setup
- [ ] NestJS setup
- [ ] Database setup (Prisma)

### Phase 2: Authentication
- [ ] User registration
- [ ] Login/Logout
- [ ] JWT implementation
- [ ] Protected routes

### Phase 3: Core Features
- [ ] Check-in functionality
- [ ] Emergency contacts CRUD
- [ ] Alert system
- [ ] Notification integration

### Phase 4: Advanced Features
- [ ] Subscription/Payment
- [ ] Analytics
- [ ] Settings customization

### Phase 5: Polish & Deploy
- [ ] Testing
- [ ] Security audit
- [ ] Deployment
- [ ] Monitoring

## 💡 Business Logic

### Free Plan
- 1 emergency contact
- Email notifications only
- 48-hour grace period
- Basic support

### Premium Plan ($8/month)
- Unlimited emergency contacts
- SMS + Email notifications
- Custom grace period (1-72 hours)
- Priority support
- Voice message feature
- Location tracking

## 🔐 Security Considerations

- Password hashing (bcrypt)
- JWT token expiration
- Rate limiting on API endpoints
- Input validation & sanitization
- HTTPS only
- GDPR compliance
- Data encryption at rest
- Audit logs for sensitive operations
