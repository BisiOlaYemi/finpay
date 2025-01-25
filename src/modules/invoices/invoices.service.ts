import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { User } from '../users/entities/user.entity';
import { generateInvoiceNumber } from '../../shared/utils/invoice-number.generator';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>
  ) {}

  async createInvoice(
    user: User, 
    createInvoiceDto: CreateInvoiceDto
  ): Promise<Invoice> {
    const invoice = this.invoicesRepository.create({
      invoiceNumber: generateInvoiceNumber(),
      user: user,
      status: InvoiceStatus.DRAFT,
      items: createInvoiceDto.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice
      })),
      totalAmount: createInvoiceDto.items.reduce(
        (sum, item) => sum + (item.quantity * item.unitPrice), 
        0
      ),
      notes: createInvoiceDto.notes,
      dueDate: createInvoiceDto.dueDate
    });

    return this.invoicesRepository.save(invoice);
  }

  async findUserInvoices(userId: string): Promise<Invoice[]> {
    return this.invoicesRepository.find({
      where: { user: { id: userId } },
      relations: ['items']
    });
  }
}