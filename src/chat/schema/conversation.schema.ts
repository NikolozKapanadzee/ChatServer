import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ChatType } from 'src/enums/chat-type.enum';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({
    type: String,
    enum: Object.values(ChatType),
    required: true,
  })
  type: ChatType;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User' }],
    default: [],
  })
  participants: Types.ObjectId[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
