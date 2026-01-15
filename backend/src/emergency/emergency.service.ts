import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmergencyService {
  private readonly logger = new Logger(EmergencyService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get all emergency contacts for a user, ordered by priority
   */
  async getEmergencyContacts(userId: string) {
    return this.prisma.emergencyContact.findMany({
      where: { userId },
      orderBy: { priorityOrder: 'asc' },
    });
  }

  /**
   * Trigger emergency call to all contacts
   * (Stub for now, will integrate Twilio in Phase 2)
   */
  async triggerEmergencyCall(userId: string): Promise<void> {
    const contacts = await this.getEmergencyContacts(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, lastKnownLocation: true },
    });

    if (!user) {
      this.logger.error(`User ${userId} not found`);
      return;
    }

    if (contacts.length === 0) {
      this.logger.warn(`No emergency contacts found for user ${userId}`);
      return;
    }

    this.logger.log(`Triggering emergency call for user ${userId}`);

    for (const contact of contacts) {
      if (contact.phoneNumber) {
        await this.makeEmergencyCall(contact.phoneNumber, user.fullName);
      }
      
      if (contact.email) {
        await this.sendEmergencyEmail(contact.email, user.fullName);
      }
    }

    // Update last emergency trigger time
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastEmergencyTrigger: new Date() },
    });
  }

  /**
   * Make VoIP call (stub for Twilio integration)
   */
  private async makeEmergencyCall(phoneNumber: string, userName: string): Promise<void> {
    // TODO: Integrate with Twilio Voice API
    this.logger.log(`[STUB] Calling ${phoneNumber} for emergency: ${userName}`);
    
    const message = `Đây là thông báo tự động từ Emergency Contact. ` +
      `Người dùng ${userName} đã không tương tác với ứng dụng trong hơn 24 giờ. ` +
      `Vui lòng kiểm tra tình trạng của họ ngay lập tức.`;
    
    // Example Twilio implementation:
    // await twilioClient.calls.create({
    //   to: phoneNumber,
    //   from: TWILIO_PHONE_NUMBER,
    //   twiml: `<Response><Say language="vi-VN">${message}</Say></Response>`,
    // });
  }

  /**
   * Send emergency SMS with location
   */
  async sendEmergencySMS(
    phoneNumber: string,
    userName: string,
    location?: string,
  ): Promise<void> {
    // TODO: Integrate with Twilio SMS API
    const locationText = location ? `\nVị trí cuối: ${location}` : '';
    const message = `[KHẨN CẤP] ${userName} đã không điểm danh hơn 24h!${locationText}`;
    
    this.logger.log(`[STUB] Sending SMS to ${phoneNumber}: ${message}`);
    
    // Example Twilio implementation:
    // await twilioClient.messages.create({
    //   to: phoneNumber,
    //   from: TWILIO_PHONE_NUMBER,
    //   body: message,
    // });
  }

  /**
   * Send emergency email
   */
  private async sendEmergencyEmail(email: string, userName: string): Promise<void> {
    // TODO: Integrate with email service (SendGrid/Resend)
    this.logger.log(`[STUB] Sending emergency email to ${email} for ${userName}`);
    
    // Example implementation:
    // await emailService.send({
    //   to: email,
    //   subject: '[KHẨN CẤP] Thông báo từ Emergency Contact',
    //   html: `<p>Người dùng ${userName} đã không điểm danh hơn 24 giờ...</p>`,
    // });
  }

  /**
   * Create an alert record
   */
  async createAlert(userId: string): Promise<void> {
    const contacts = await this.getEmergencyContacts(userId);
    
    await this.prisma.alert.create({
      data: {
        userId,
        status: 'PENDING',
        contactsNotified: JSON.stringify(
          contacts.map(c => ({ name: c.name, phone: c.phoneNumber })),
        ),
      },
    });
    
    this.logger.log(`Created alert for user ${userId}`);
  }
}
