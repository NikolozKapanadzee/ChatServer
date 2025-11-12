import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Gateway } from './chat.gateway';

@Module({
  providers: [ChatService, Gateway],
})
export class ChatModule {}
