import { 
    Controller, 
    Post, 
    Get, 
    Param, 
    Body, 
    UseGuards, 
    Request, 
    Query
  } from '@nestjs/common';
  import { AccountsService } from './accounts.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { CreateAccountDto } from './dto/create-account.dto';
  import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatementResponseDto } from './dto/statement-response.dto';
import { StatementQueryDto } from './dto/statement-query.dto';
  
  @ApiTags('accounts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('accounts')
  export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}
  
    @Post()
    createAccount(
      @Request() req, 
      @Body() createAccountDto: CreateAccountDto
    ) {
      return this.accountsService.createAccount(req.user, createAccountDto);
    }
  
    @Get()
    getUserAccounts(@Request() req) {
      return this.accountsService.findUserAccounts(req.user.id);
    }
  
    @Get(':id')
    getAccountDetails(
      @Param('id') accountId: string
    ) {
      return this.accountsService.findAccountById(accountId);
    }

  @Post(':id/deposit')
  @UseGuards(JwtAuthGuard)
  depositToAccount(
    @Param('id') accountId: string,
    @Body() depositDto: { amount: number, description?: string }
  ) {
    return this.accountsService.deposit(
      accountId, 
      depositDto.amount, 
      depositDto.description
    );
  }

  @Post(':id/withdraw')
  @UseGuards(JwtAuthGuard)
  withdrawFromAccount(
    @Param('id') accountId: string,
    @Body() withdrawDto: { amount: number, description?: string }
  ) {
    return this.accountsService.withdraw(
      accountId, 
      withdrawDto.amount, 
      withdrawDto.description
    );
  }

  @Get(':id/statement')
  @ApiOperation({ summary: 'Get account statement' })
  @ApiResponse({ 
    status: 200, 
    description: 'Account statement generated successfully',
    type: StatementResponseDto 
  })
  async getAccountStatement(
    @Param('id') accountId: string,
    @Query() query: StatementQueryDto
  ): Promise<StatementResponseDto> {
    return this.accountsService.generateStatement(accountId, query);
  }

}
  