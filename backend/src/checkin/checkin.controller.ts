import { Controller, Post, Get, UseGuards, Req, Query } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('checkin')
@UseGuards(JwtAuthGuard)
export class CheckinController {
    constructor(private checkinService: CheckinService) { }

    @Post()
    async checkIn(@Req() req: any) {
        const userId = req.user.id;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        return this.checkinService.recordCheckIn(userId, ipAddress, userAgent);
    }

    @Get('status')
    async getStatus(@Req() req: any) {
        const userId = req.user.id;
        return this.checkinService.getCheckInStatus(userId);
    }

    @Get('history')
    async getHistory(@Req() req: any, @Query('limit') limit?: string) {
        const userId = req.user.id;
        const limitNum = limit ? parseInt(limit, 10) : 30;
        return this.checkinService.getCheckInHistory(userId, limitNum);
    }
}
