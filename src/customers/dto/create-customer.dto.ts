import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
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

  // identity-service user id. Assignment goes through this DTO (and
  // UpdateCustomerDto via PartialType) rather than a dedicated endpoint --
  // no separate assignment UI/API exists in v1.
  @IsOptional()
  @IsUUID()
  assignedRep?: string;
}
