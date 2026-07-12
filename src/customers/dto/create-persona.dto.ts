import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePersonaDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  title?: string;
}
