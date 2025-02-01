import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountType, Currency } from './entities/account.entity';
import { User } from '../users/entities/user.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { Transaction, TransactionType } from '../transactions/entities/transaction.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { StatementQueryDto } from './dto/statement-query.dto';
import { StatementResponseDto } from './dto/statement-response.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @Inject(forwardRef(() => TransactionsService))
    private transactionsService: TransactionsService,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>
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
    
    const account = await this.accountsRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.user', 'user')
      .leftJoinAndSelect('account.transactions', 'transactions')
      .where('account.id = :id', { id: accountId })
      .getOne();
  
    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }
  
    return account;
  }

  async updateBalance(accountId: string, amount: number): Promise<Account> {
    await this.accountsRepository
      .createQueryBuilder()
      .update(Account)
      .set({
        balance: () => `balance + :amount`,
        updatedAt: new Date()
      })
      .where('id = :id', { id: accountId })
      .setParameter('amount', amount)
      .execute();

    return this.findAccountById(accountId);
  }

  async deposit(accountId: string, amount: number, description?: string): Promise<Account> {
    const account = await this.findAccountById(accountId);
    
    if (amount <= 0) {
      throw new BadRequestException('Deposit amount must be positive');
    }

    await this.createDepositTransaction(account, amount, description);
    
    
    return this.findAccountById(accountId);
  }


  async withdraw(accountId: string, amount: number, description?: string): Promise<Account> {
    const account = await this.findAccountById(accountId);
  
    if (amount <= 0) {
      throw new BadRequestException('Withdrawal amount must be positive');
    }
  
    if (account.balance < amount) {
      throw new BadRequestException('Insufficient funds');
    }
  
    // Create the transaction first
    await this.createWithdrawalTransaction(account, amount, description);
  
    // Update account balance
    return this.updateBalance(accountId, -amount);
  }
  
  private async createWithdrawalTransaction(
    account: Account, 
    amount: number, 
    description?: string
  ) {
    return this.transactionsService.createTransaction({
      accountId: account.id,
      amount: amount,
      type: TransactionType.WITHDRAWAL,
      description: description || 'Withdrawal'
    });
  }
  

  private async createDepositTransaction(
    account: Account, 
    amount: number, 
    description?: string
  ) {
    return this.transactionsService.createTransaction({
      accountId: account.id,
      amount: amount,
      type: TransactionType.DEPOSIT,
      description: description || 'Deposit'
    });
  }

  async generateStatement(
    accountId: string,
    query: StatementQueryDto
  ): Promise<StatementResponseDto> {
    const account = await this.accountsRepository.findOne({
      where: { id: accountId },
      relations: ['transactions']
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const startDate = query.startDate || new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDate = query.endDate || new Date();

    // Get transactions for the period
    const transactions = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.accountId = :accountId', { accountId })
      .andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('transaction.createdAt', 'DESC')
      .skip(query.offset)
      .take(query.limit)
      .getMany();

    // Calculate balances and totals
    const { totalCredits, totalDebits } = this.calculateTransactionTotals(transactions);

    // Get starting balance (balance before start date)
    const startingBalance = await this.calculateBalanceAtDate(accountId, startDate);

    return {
      accountNumber: account.accountNumber,
      currency: account.currency,
      startingBalance,
      endingBalance: startingBalance + totalCredits + totalDebits,
      transactions,
      statementPeriod: {
        from: startDate,
        to: endDate,
      },
      totalCredits,
      totalDebits,
    };
  }

  private calculateTransactionTotals(transactions: Transaction[]) {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === TransactionType.DEPOSIT || 
            transaction.type === TransactionType.REFUND) {
          acc.totalCredits += transaction.amount;
        } else if (transaction.type === TransactionType.WITHDRAWAL || 
                   transaction.type === TransactionType.PAYMENT) {
          acc.totalDebits -= transaction.amount;
        }
        return acc;
      },
      { totalCredits: 0, totalDebits: 0 }
    );
  }

  private async calculateBalanceAtDate(accountId: string, date: Date): Promise<number> {
    const transactions = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.accountId = :accountId', { accountId })
      .andWhere('transaction.createdAt < :date', { date })
      .getMany();

    const { totalCredits, totalDebits } = this.calculateTransactionTotals(transactions);
    return totalCredits + totalDebits;
  }


}
