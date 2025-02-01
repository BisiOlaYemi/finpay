import { ApiProperty } from '@nestjs/swagger';
import { CardStatus, CardType } from '../entities/virtual-card.entity';

export class VirtualCardResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  cardNumber: string;

  @ApiProperty()
  cvv: string;

  @ApiProperty()
  expiryDate: Date;

  @ApiProperty({ enum: CardType })
  type: CardType;

  @ApiProperty({ enum: CardStatus })
  status: CardStatus;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  createdAt: Date;
}