import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';

import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { VirtualCardsModule } from './modules/virtual-cards/virtual-cards.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        autoLoadEntities: true,
        synchronize: configService.get('database.synchronize'),
        ssl: configService.get('database.ssl'), 
    logging: configService.get('database.logging') 
      }),
      inject: [ConfigService]
    }),
    AuthModule,
    UsersModule,
    AccountsModule,
    TransactionsModule,
    InvoicesModule,
    PaymentsModule,
    VirtualCardsModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}