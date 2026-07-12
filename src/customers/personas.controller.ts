import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { PersonasService } from './personas.service';

@Controller('customers/:customerId/personas')
export class PersonasController {
  constructor(private readonly personas: PersonasService) {}

  @Post()
  create(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Body() dto: CreatePersonaDto,
  ) {
    return this.personas.create(customerId, dto);
  }

  @Get()
  findAll(@Param('customerId', ParseUUIDPipe) customerId: string) {
    return this.personas.findAll(customerId);
  }

  @Get(':id')
  findOne(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.personas.findOne(customerId, id);
  }

  @Patch(':id')
  update(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePersonaDto,
  ) {
    return this.personas.update(customerId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.personas.remove(customerId, id);
  }
}
