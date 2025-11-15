import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './schema/message.schema';
import { Conversation } from './schema/conversation.schema';
import { ChatType } from 'src/enums/chat-type.enum';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Conversation.name) private convModel: Model<Conversation>,
  ) {}

  async sendMessage(senderId: string, content: string, receiverId?: string) {
    let conversation;

    if (receiverId) {
      conversation = await this.convModel.findOne({
        type: ChatType.PRIVATE,
        participants: { $all: [senderId, receiverId] },
      });

      if (!conversation) {
        conversation = await this.convModel.create({
          type: ChatType.PRIVATE,
          participants: [senderId, receiverId],
        });
      }
    } else {
      conversation = await this.convModel.findOne({ type: ChatType.GLOBAL });
      if (!conversation) {
        conversation = await this.convModel.create({ type: ChatType.GLOBAL });
      }
    }

    const message = await this.messageModel.create({
      conversation: conversation._id,
      sender: senderId,
      content,
      receiverId: receiverId ? new Types.ObjectId(receiverId) : null,
      type: receiverId ? ChatType.PRIVATE : ChatType.GLOBAL,
    });

    return message.populate('sender', 'username');
  }
}
