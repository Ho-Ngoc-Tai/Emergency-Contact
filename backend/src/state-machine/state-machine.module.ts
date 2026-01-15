import { Module } from '@nestjs/common';
import { StateMachineService } from './state-machine.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [StateMachineService],
  exports: [StateMachineService],
})
export class StateMachineModule {}
