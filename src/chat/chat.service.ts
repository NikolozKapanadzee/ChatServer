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

  async sendMessage(senderId: string, content: string) {
    let conversation = await this.convModel.findOne({ type: ChatType.GLOBAL });

    if (!conversation) {
      conversation = await this.convModel.create({
        type: ChatType.GLOBAL,
        participants: [],
      });
    }

    const message = await this.messageModel.create({
      conversation: conversation._id,
      sender: senderId,
      content,
      type: ChatType.GLOBAL,
    });

    return message.populate('sender', 'username avatarUrl');
  }

  async sendPrivateMessage(
    senderId: string,
    receiverId: string,
    content: string,
  ) {
    const conversation = await this.findOrCreateConversation(
      senderId,
      receiverId,
    );

    const message = await this.messageModel.create({
      conversation: conversation._id,
      sender: senderId,
      content,
      receiverId: new Types.ObjectId(receiverId),
      type: ChatType.PRIVATE,
    });

    conversation.messages.push(message._id as Types.ObjectId);
    await conversation.save();

    return message.populate('sender', 'username avatarUrl');
  }

  async findOrCreateConversation(userId1: string, userId2: string) {
    const participants = [userId1, userId2].sort();
    let conversation = await this.convModel.findOne({
      type: ChatType.PRIVATE,
      participants: { $all: participants, $size: 2 },
    });
    if (!conversation) {
      conversation = await this.convModel.create({
        type: ChatType.PRIVATE,
        participants,
        messages: [],
      });
    }

    return conversation;
  }

  async getConversation(userId1: string, userId2: string) {
    const participants = [userId1, userId2].sort();

    const conversation = await this.convModel
      .findOne({
        type: ChatType.PRIVATE,
        participants: { $all: participants, $size: 2 },
      })
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'username avatarUrl',
        },
      })
      .populate('participants', 'username avatarUrl');

    if (!conversation) {
      return { messages: [] };
    }

    return conversation;
  }

  async getUserConversations(userId: string) {
    const conversations = await this.convModel
      .find({
        type: ChatType.PRIVATE,
        participants: userId,
      })
      .populate('participants', 'username avatarUrl')
      .populate({
        path: 'messages',
        options: { limit: 1, sort: { createdAt: -1 } },
        populate: {
          path: 'sender',
          select: 'username',
        },
      })
      .sort({ updatedAt: -1 });

    return conversations;
  }
}
