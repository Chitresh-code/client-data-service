import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';
import { Persona } from './entities/persona.entity';
import { PersonasController } from './personas.controller';
import { PersonasService } from './personas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Persona])],
  controllers: [CustomersController, PersonasController],
  providers: [CustomersService, PersonasService],
})
export class CustomersModule {}
