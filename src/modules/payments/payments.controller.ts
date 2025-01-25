import { 
    Controller, 
    Post, 
    Body, 
    UseGuards, 
    Request 
  } from '@nestjs/common';
  import { PaymentsService } from './payments.service';
  import { CreatePaymentDto } from './dto/create-payment.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
  
  @ApiTags('payments')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('payments')
  export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}
  
    @Post()
    createPayment(
      @Request() req, 
      @Body() createPaymentDto: CreatePaymentDto
    ) {
      return this.paymentsService.createPayment(req.user, createPaymentDto);
    }
  }