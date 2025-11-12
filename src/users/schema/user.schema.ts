import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserStatus } from 'src/enums/user-status.enum';

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
    required: false,
  })
  avatarUrl?: string;

  @Prop({
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.OFFLINE,
  })
  status: 'online' | 'offline';
}

export const UserSchema = SchemaFactory.createForClass(User);
