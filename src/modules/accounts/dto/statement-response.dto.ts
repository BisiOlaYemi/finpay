import { Transaction } from '../../transactions/entities/transaction.entity';

export class StatementResponseDto {
  accountNumber: string;
  currency: string;
  startingBalance: number;
  endingBalance: number;
  transactions: Transaction[];
  statementPeriod: {
    from: Date;
    to: Date;
  };
  totalCredits: number;
  totalDebits: number;
}