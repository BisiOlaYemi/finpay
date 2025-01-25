import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateWithdrawalDto {
  @IsNumber()
  amount: number;

  @IsString()
  accountId: string;

  @IsOptional()
  @IsString()
  destinationMethod?: string; 
}