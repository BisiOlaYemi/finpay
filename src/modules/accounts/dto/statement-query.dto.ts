import { IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class StatementQueryDto {
  
  @IsDateString()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  limit?: number = 50;

  @IsOptional()
  offset?: number = 0;
}