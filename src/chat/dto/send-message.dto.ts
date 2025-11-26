import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'hello everyone' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: '69235ea1c400c8a0d2b378c0' })
  @IsMongoId()
  @IsOptional()
  receiverId?: string;
}
