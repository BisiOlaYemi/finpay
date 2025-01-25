import { IsEnum, IsOptional, IsDecimal } from 'class-validator';
import { AccountType, Currency } from '../entities/account.entity';

export class CreateAccountDto {
  @IsEnum(AccountType)
  @IsOptional()
  type?: AccountType;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @IsDecimal()
  @IsOptional()
  initialBalance?: number;
}