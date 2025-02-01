import { Injectable, BadRequestException, forwardRef, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from './entities/transaction.entity';
import { AccountsService } from '../accounts/accounts.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @Inject(forwardRef(() => AccountsService)) 
    private accountsService: AccountsService,
  ) {}

  async createTransaction(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const account = await this.accountsService.findAccountById(createTransactionDto.accountId);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    
    switch (createTransactionDto.type) {
      case TransactionType.DEPOSIT:
        if (createTransactionDto.amount <= 0) {
          throw new BadRequestException('Deposit amount must be positive');
        }
        break;
      case TransactionType.WITHDRAWAL:
        if (createTransactionDto.amount > account.balance) {
          throw new BadRequestException('Insufficient funds');
        }
        break;
    }

    // Create and save the transaction first
    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      account: account,
      accountId: account.id,  
      status: TransactionStatus.COMPLETED  
    });

    const savedTransaction = await this.transactionsRepository.save(transaction);

    // Update account balance directly using query builder to ensure accuracy
    await this.accountsService.updateBalance(
      account.id,
      this.calculateBalanceChange(createTransactionDto.type, createTransactionDto.amount)
    );

    return savedTransaction;
  }

    

  private calculateBalanceChange(
    type: TransactionType, 
    amount: number
  ): number {
    switch (type) {
      case TransactionType.DEPOSIT:
      case TransactionType.REFUND:
        return amount;
      case TransactionType.WITHDRAWAL:
      case TransactionType.PAYMENT:
        return -amount;
      case TransactionType.TRANSFER:
        return 0; 
      default:
        return 0;
    }
  }
}