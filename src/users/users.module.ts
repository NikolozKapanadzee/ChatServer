import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [
    AwsModule,
    MongooseModule.forFeature([{ schema: UserSchema, name: User.name }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
