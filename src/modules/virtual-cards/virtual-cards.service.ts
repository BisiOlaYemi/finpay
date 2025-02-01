import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VirtualCard, CardStatus, CardType } from './entities/virtual-card.entity';
import { CreateVirtualCardDto } from './dto/create-virtual-card.dto';
import { AccountsService } from '../accounts/accounts.service';
import { User } from '../users/entities/user.entity';
import { generateCardNumber } from '../../shared/utils/card-number.generator';

@Injectable()
export class VirtualCardsService {
  constructor(
    @InjectRepository(VirtualCard)
    private virtualCardRepository: Repository<VirtualCard>,
    private accountsService: AccountsService
  ) {}

  async createVirtualCard(
    user: User, 
    createVirtualCardDto: CreateVirtualCardDto
  ): Promise<VirtualCard> {
    const linkedAccount = await this.accountsService.findAccountById(
      createVirtualCardDto.accountId
    );

    if (createVirtualCardDto.initialBalance && 
        linkedAccount.balance < createVirtualCardDto.initialBalance) {
      throw new BadRequestException('Insufficient account balance');
    }

    const virtualCard = this.virtualCardRepository.create({
      cardNumber: generateCardNumber(),
      cvv: this.generateCVV(),
      expiryDate: this.calculateExpiryDate(),
      type: createVirtualCardDto.type || CardType.MULTI_USE,
      status: CardStatus.ACTIVE,
      balance: createVirtualCardDto.initialBalance || 0,
      user: user,
      linkedAccount: linkedAccount
    });

    return this.virtualCardRepository.save(virtualCard);
  }

  private generateCVV(): string {
    return Math.floor(100 + Math.random() * 900).toString();
  }

  private calculateExpiryDate(): Date {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 3);
    return expiry;
  }

  async findUserVirtualCards(userId: string): Promise<VirtualCard[]> {
    return this.virtualCardRepository.find({
      where: { user: { id: userId } },
      relations: ['linkedAccount']
    });
  }
  
  async blockVirtualCard(cardId: string, userId: string): Promise<VirtualCard> {
    const virtualCard = await this.virtualCardRepository.findOne({
      where: { 
        id: cardId, 
        user: { id: userId } 
      }
    });
  
    if (!virtualCard) {
      throw new NotFoundException('Virtual card not found');
    }
  
    virtualCard.status = CardStatus.BLOCKED;
    return this.virtualCardRepository.save(virtualCard);
  }
}