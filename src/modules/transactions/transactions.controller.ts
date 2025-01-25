import { 
    Controller, 
    Post, 
    Body, 
    UseGuards, 
    Request 
  } from '@nestjs/common';
  import { TransactionsService } from './transactions.service';
  import { CreateTransactionDto } from './dto/create-transaction.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
  
  @ApiTags('transactions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('transactions')
  export class TransactionsController {
    constructor(
      private readonly transactionsService: TransactionsService
    ) {}
  
    @Post()
    createTransaction(
      @Body() createTransactionDto: CreateTransactionDto
    ) {
      return this.transactionsService.createTransaction(createTransactionDto);
    }
  }