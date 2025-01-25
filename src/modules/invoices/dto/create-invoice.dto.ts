import { IsArray, ValidateNested, IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

class InvoiceItemDto {
  @IsString()
  description: string;

  @Type(() => Number)
  quantity: number;

  @Type(() => Number)
  unitPrice: number;
}

export class CreateInvoiceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;
}