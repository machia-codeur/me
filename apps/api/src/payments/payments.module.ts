import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { EscrowProcessor } from './processors/escrow.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'escrow' }),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, EscrowProcessor],
  exports: [PaymentsService],
})
export class PaymentsModule {}
