import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async create(customerId: string, dto: CreatePersonaDto): Promise<Persona> {
    await this.customers.findOne(customerId);
    return this.personas.save(this.personas.create({ ...dto, customerId }));
  }

  findAll(customerId: string): Promise<Persona[]> {
    return this.personas.find({ where: { customerId } });
  }

  async findOne(customerId: string, id: string): Promise<Persona> {
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
  ): Promise<Persona> {
    const persona = await this.findOne(customerId, id);
    return this.personas.save(this.personas.merge(persona, dto));
  }

  async remove(customerId: string, id: string): Promise<void> {
    const persona = await this.findOne(customerId, id);
    await this.personas.remove(persona);
  }
}
