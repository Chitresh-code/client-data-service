import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload } from '../auth/jwt.strategy';
import { CustomersService } from './customers.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { Persona } from './entities/persona.entity';

@Injectable()
export class PersonasService {
  constructor(
    @InjectRepository(Persona)
    private readonly personas: Repository<Persona>,
    private readonly customers: CustomersService,
  ) {}

  // Every method here goes through CustomersService.findOne first -- that's
  // both the existence check for customerId (previously only done in
  // create, not findAll/findOne/update/remove) and the RBAC boundary: a
  // member without access to the parent customer gets the same 404 a
  // nonexistent customerId would produce.

  async create(
    customerId: string,
    dto: CreatePersonaDto,
    caller: JwtPayload,
  ): Promise<Persona> {
    await this.customers.findOne(customerId, caller);
    return this.personas.save(this.personas.create({ ...dto, customerId }));
  }

  async findAll(customerId: string, caller: JwtPayload): Promise<Persona[]> {
    await this.customers.findOne(customerId, caller);
    return this.personas.find({ where: { customerId } });
  }

  async findOne(
    customerId: string,
    id: string,
    caller: JwtPayload,
  ): Promise<Persona> {
    await this.customers.findOne(customerId, caller);
    const persona = await this.personas.findOneBy({ id, customerId });
    if (!persona) {
      throw new NotFoundException(
        `Persona ${id} not found for customer ${customerId}`,
      );
    }
    return persona;
  }

  async update(
    customerId: string,
    id: string,
    dto: UpdatePersonaDto,
    caller: JwtPayload,
  ): Promise<Persona> {
    const persona = await this.findOne(customerId, id, caller);
    return this.personas.save(this.personas.merge(persona, dto));
  }

  async remove(
    customerId: string,
    id: string,
    caller: JwtPayload,
  ): Promise<void> {
    const persona = await this.findOne(customerId, id, caller);
    await this.personas.remove(persona);
  }
}
