import { 
    Controller, 
    Post, 
    Get, 
    Param, 
    Body, 
    UseGuards, 
    Request 
  } from '@nestjs/common';
  import { AccountsService } from './accounts.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { CreateAccountDto } from './dto/create-account.dto';
  import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
  
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
  }
  