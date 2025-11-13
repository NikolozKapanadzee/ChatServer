import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  username: string;
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
