import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VirtualCard } from "./entities/virtual-card.entity";
import { AccountsModule } from "../accounts/accounts.module";
import { UsersModule } from "../users/users.module";
import { VirtualCardsController } from "./virtual-cards.controller";
import { VirtualCardsService } from "./virtual-cards.service";

@Module({
    imports: [
      TypeOrmModule.forFeature([VirtualCard]),
      AccountsModule,
      UsersModule
    ],
    controllers: [VirtualCardsController],
    providers: [VirtualCardsService],
    exports: [VirtualCardsService]
  })
  export class VirtualCardsModule {}
