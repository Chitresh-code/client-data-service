import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
  ) {}

  create(dto: CreateCustomerDto): Promise<Customer> {
    return this.customers.save(this.customers.create(dto));
  }

  findAll(): Promise<Customer[]> {
    return this.customers.find();
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customers.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer ${id} not found`);
    }
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    return this.customers.save(this.customers.merge(customer, dto));
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customers.remove(customer);
  }
}
