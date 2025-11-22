import { SignUpDto } from './dto/sign-up.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}
  private awsService: AwsService;

  async uploadFile(file: Express.Multer.File) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, password, avatarUrl, username } = signUpDto;
    const existUser = await this.userModel.findOne({ email });
    if (existUser) {
      throw new BadRequestException('user already exist');
    }
    const existUserName = await this.userModel.findOne({ username });
    if (existUserName) {
      throw new BadRequestException('username is taken');
    }
    const hashedPass = await bcrypt.hash(password, 10);
    const newUser = await this.userModel.create({
      email,
      password: hashedPass,
      avatarUrl,
      username,
    });
    const newUserWithoutPassword = await this.userModel
      .findById(newUser._id)
      .select('-password');
    return {
      message: 'user registered successfully',
      data: newUserWithoutPassword,
    };
  }
  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const existUser = await this.userModel
      .findOne({ email })
      .select('password');
    if (!existUser) {
      throw new NotFoundException('user does not exist');
    }
    const isPassEqual = await bcrypt.compare(password, existUser.password);
    if (!isPassEqual) {
      throw new BadRequestException('invalid credentials');
    }
    const payload = { id: existUser._id };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });
    return {
      token,
    };
  }
  async currentUser(userId) {
    const user = await this.userModel.findById(userId);
    return user;
  }
}
