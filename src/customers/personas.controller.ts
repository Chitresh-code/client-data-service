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
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
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
    @CurrentUser() caller: JwtPayload,
  ) {
    return this.personas.create(customerId, dto, caller);
  }

  @Get()
  findAll(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @CurrentUser() caller: JwtPayload,
  ) {
    return this.personas.findAll(customerId, caller);
  }

  @Get(':id')
  findOne(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() caller: JwtPayload,
  ) {
    return this.personas.findOne(customerId, id, caller);
  }

  @Patch(':id')
  update(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePersonaDto,
    @CurrentUser() caller: JwtPayload,
  ) {
    return this.personas.update(customerId, id, dto, caller);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() caller: JwtPayload,
  ) {
    return this.personas.remove(customerId, id, caller);
  }
}
