import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountType, Currency } from './entities/account.entity';
import { User } from '../users/entities/user.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { generateAccountNumber } from '../../shared/utils/account-number.generator';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>
  ) {}

  async createAccount(
    user: User, 
    createAccountDto: CreateAccountDto
  ): Promise<Account> {
    const account = this.accountsRepository.create({
      accountNumber: this.generateUniqueAccountNumber(), 
      type: createAccountDto.type || AccountType.CHECKING,
      currency: createAccountDto.currency || Currency.USD,
      balance: createAccountDto.initialBalance || 0,
      user: user,
      isActive: true
    });
  
    return this.accountsRepository.save(account);
  }
  
  
  private generateUniqueAccountNumber(): string {
    const prefix = '5901';
    const randomPart = Math.floor(10000000 + Math.random() * 90000000).toString();
    const checksum = this.calculateChecksum(prefix + randomPart);
    return `${prefix}${randomPart}${checksum}`;
  }
  
  private calculateChecksum(accountNumberWithoutChecksum: string): string {
    const weights = [7, 3, 1];
    let sum = 0;
    
    for (let i = 0; i < accountNumberWithoutChecksum.length; i++) {
      sum += parseInt(accountNumberWithoutChecksum[i]) * weights[i % 3];
    }
    
    const checksum = (10 - (sum % 10)) % 10;
    return checksum.toString();
  }

  async findUserAccounts(userId: string): Promise<Account[]> {
    return this.accountsRepository.find({
      where: { user: { id: userId } },
      relations: ['transactions']
    });
  }

  async findAccountById(accountId: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id: accountId },
      relations: ['user', 'transactions']
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async updateBalance(
    accountId: string, 
    amount: number
  ): Promise<Account> {
    const account = await this.findAccountById(accountId);
    account.balance += amount;
    return this.accountsRepository.save(account);
  }
}