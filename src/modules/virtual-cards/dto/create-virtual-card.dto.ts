import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CardType } from '../entities/virtual-card.entity';

export class CreateVirtualCardDto {
  @ApiProperty({
    description: 'The ID of the account to link the virtual card to',
    example: '123e4567-e89b-12d3-xyz...'
  })
  @IsString()
  accountId: string;

  @ApiPropertyOptional({
    enum: CardType,
    description: 'Type of virtual card',
    default: CardType.MULTI_USE
  })
  @IsEnum(CardType)
  @IsOptional()
  type?: CardType;

  @ApiPropertyOptional({
    description: 'Initial balance for the virtual card',
    example: 100.00
  })
  @IsNumber()
  @IsOptional()
  initialBalance?: number;
}