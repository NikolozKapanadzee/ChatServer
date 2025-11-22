import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [
    AwsModule,
    MongooseModule.forFeature([{ schema: UserSchema, name: User.name }]),
    ConfigModule.forRoot(),
    JwtModule.register({ global: true, secret: process.env.JWT_SECRET }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
