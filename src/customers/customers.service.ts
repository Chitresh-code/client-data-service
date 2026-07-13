import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload } from '../auth/jwt.strategy';
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

  // A "member" caller only sees customers assigned to them. Any other
  // caller -- "lead", or no role claim at all (an application token, i.e.
  // service-to-service, not end-user) -- sees everything unfiltered.
  findAll(caller: JwtPayload): Promise<Customer[]> {
    if (caller.role === 'member') {
      return this.customers.find({ where: { assignedRep: caller.sub } });
    }
    return this.customers.find();
  }

  // Same scoping as findAll: a member asking for an id outside their own
  // assignment gets 404, same as an id that doesn't exist at all -- not a
  // 403, so this doesn't confirm or deny another rep's account exists.
  async findOne(id: string, caller: JwtPayload): Promise<Customer> {
    const customer = await this.customers.findOneBy({ id });
    if (
      !customer ||
      (caller.role === 'member' && customer.assignedRep !== caller.sub)
    ) {
      throw new NotFoundException(`Customer ${id} not found`);
    }
    return customer;
  }

  async update(
    id: string,
    dto: UpdateCustomerDto,
    caller: JwtPayload,
  ): Promise<Customer> {
    const customer = await this.findOne(id, caller);
    return this.customers.save(this.customers.merge(customer, dto));
  }

  async remove(id: string, caller: JwtPayload): Promise<void> {
    const customer = await this.findOne(id, caller);
    await this.customers.remove(customer);
  }
}
