import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { CustomerStatus } from '../entities/customer.entity';

export class CreateCustomerDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  employeeCount?: number;

  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;
}
