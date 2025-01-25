import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AccountsService } from '../accounts/accounts.service';
import { StripePaymentGateway } from './gateways/stripe.gateway';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private accountsService: AccountsService,
    private stripeGateway: StripePaymentGateway
  ) {}

  async createPayment(
    user: User, 
    createPaymentDto: CreatePaymentDto
  ): Promise<Payment> {
    const sourceAccount = await this.accountsService.findAccountById(
      createPaymentDto.sourceAccountId
    );

    if (sourceAccount.balance < createPaymentDto.amount) {
      throw new BadRequestException('Insufficient funds');
    }

    try {
      const paymentResult = await this.stripeGateway.processPayment(
        createPaymentDto.amount,
        createPaymentDto.sourceAccountId
      );

      const payment = this.paymentsRepository.create({
        amount: createPaymentDto.amount,
        method: createPaymentDto.method,
        user: user,
        sourceAccount: sourceAccount,
        status: paymentResult.status === 'succeeded' 
          ? PaymentStatus.COMPLETED 
          : PaymentStatus.FAILED,
        externalTransactionId: paymentResult.transactionId
      });

      return this.paymentsRepository.save(payment);
    } catch (error) {
      throw new BadRequestException(`Payment processing failed: ${error.message}`);
    }
  }
}