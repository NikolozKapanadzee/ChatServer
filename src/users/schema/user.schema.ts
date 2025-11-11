import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
    select: false,
  })
  password: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  username: string;

  @Prop({
    type: String,
    default: null,
  })
  avatarUrl: string;

  @Prop({
    type: String,
    enum: ['online', 'offline'],
    default: 'offline',
  })
  status: 'online' | 'offline';
}

export const UserSchema = SchemaFactory.createForClass(User);
