import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateDepositDto {
  @IsNumber()
  amount: number;

  @IsString()
  accountId: string;

  @IsOptional()
  @IsString()
  description?: string;
}