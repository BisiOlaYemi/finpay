import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Account } from '../../accounts/entities/account.entity';

export enum CardType {
  SINGLE_USE = 'single_use',
  MULTI_USE = 'multi_use',
  VIRTUAL_SPENDING = 'virtual_spending'
}

export enum CardStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  EXPIRED = 'expired'
}

@Entity('virtual_cards')
export class VirtualCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cardNumber: string;

  @Column()
  cvv: string;

  @Column()
  expiryDate: Date;

  @Column({
    type: 'enum',
    enum: CardType,
    default: CardType.MULTI_USE
  })
  type: CardType;

  @Column({
    type: 'enum',
    enum: CardStatus,
    default: CardStatus.ACTIVE
  })
  status: CardStatus;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  balance: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Account)
  linkedAccount: Account;

  @CreateDateColumn()
  createdAt: Date;
}