import { Injectable, BadRequestException } from '@nestjs/common';
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
    private accountsService: AccountsService
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto
  ): Promise<Transaction> {
    const account = await this.accountsService.findAccountById(
      createTransactionDto.accountId
    );

    // Validate transaction based on type
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

    // Create transaction
    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      account: account,
      status: TransactionStatus.PENDING
    });

    // Update account balance
    const balanceChange = this.calculateBalanceChange(
      createTransactionDto.type, 
      createTransactionDto.amount
    );
    await this.accountsService.updateBalance(
      createTransactionDto.accountId, 
      balanceChange
    );

    // Save and return transaction
    return this.transactionsRepository.save(transaction);
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
        return 0; // Handled separately
      default:
        return 0;
    }
  }
}