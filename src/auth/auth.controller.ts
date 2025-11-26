import { SignUpDto } from './dto/sign-up.dto';
import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { UserId } from 'src/decorators/user.decorator';
import { IsAuthGuard } from 'src/guards/IsAuth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   console.log(file);
  //   return this.authService.uploadFile(file);
  // }

  @ApiResponse({
    status: 201,
    schema: {
      example: 'user registered successfully',
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    examples: {
      userExists: {
        summary: 'User already exists',
        value: {
          statusCode: 400,
          message: 'User already exists',
          error: 'Bad Request',
        },
      },
      usernameTaken: {
        summary: 'Username is taken',
        value: {
          statusCode: 400,
          message: 'Username is taken',
          error: 'Bad Request',
        },
      },
    },
  })
  @Post('sign-up')
  @UseInterceptors(FileInterceptor('file'))
  signUp(
    @Body() signUpDto: SignUpDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.authService.signUp(signUpDto, file);
  }
  @ApiResponse({
    status: 201,
    schema: {
      example:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MTBlMTg4NzYxZjQ3N2UzMTYyNTMzNyIsImlhdCI6MTc2MjcxNTAzNSwiZXhwIjoxNzYyNzE4NjM1fQ.ZWIDwsow-DMaF76v1KQtL5HYIFbB0kk728cyyx6BNKw',
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    examples: {
      userDoesNotExists: {
        summary: 'User does not exists',
        value: {
          statusCode: 400,
          message: 'User does not exists',
          error: 'Bad Request',
        },
      },
      passIsNotEqual: {
        summary: 'password is not equal',
        value: {
          statusCode: 400,
          message: 'invalid credentials',
          error: 'Bad Request',
        },
      },
    },
  })
  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Get('current-user')
  @ApiBearerAuth()
  @UseGuards(IsAuthGuard)
  currentUser(@UserId() userId: string) {
    console.log(userId);
    return this.authService.currentUser(userId);
  }
}
