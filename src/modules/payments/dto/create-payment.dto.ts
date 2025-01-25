import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsString()
  sourceAccountId: string;

  @IsOptional()
  @IsString()
  recipientEmail?: string;
}