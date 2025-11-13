import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ChatType } from 'src/enums/chat-type.enum';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  receiverId?: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Conversation' })
  conversation: Types.ObjectId;

  @Prop({ required: true, enum: ChatType, default: ChatType.GLOBAL })
  type: ChatType;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
