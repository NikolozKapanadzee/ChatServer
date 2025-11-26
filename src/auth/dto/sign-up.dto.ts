import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'johndoe@gmail.com' })
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({ example: 'password123', minLength: 8, maxLength: 20 })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;
  @ApiProperty({ example: 'john doe' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  username: string;
  @ApiProperty({
    example: 'avatars/55be42b5-bcc1-4cf0-8746-356084c45e86.webp',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
