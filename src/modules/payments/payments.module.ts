import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { AccountsModule } from '../accounts/accounts.module';
import { StripePaymentGateway } from './gateways/stripe.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    AccountsModule
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService, 
    StripePaymentGateway
  ],
  exports: [PaymentsService]
})
export class PaymentsModule {}