import { 
    Controller, 
    Post, 
    Get, 
    Body, 
    UseGuards, 
    Request 
  } from '@nestjs/common';
  import { InvoicesService } from './invoices.service';
  import { CreateInvoiceDto } from './dto/create-invoice.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
  
  @ApiTags('invoices')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('invoices')
  export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) {}
  
    @Post()
    createInvoice(
      @Request() req, 
      @Body() createInvoiceDto: CreateInvoiceDto
    ) {
      return this.invoicesService.createInvoice(req.user, createInvoiceDto);
    }
  
    @Get()
    getUserInvoices(@Request() req) {
      return this.invoicesService.findUserInvoices(req.user.id);
    }
  }