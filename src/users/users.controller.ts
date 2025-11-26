import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiParam({
    name: 'id',
    type: String,
    description: 'The mongo Id of the user',
    example: '692722f0fef6975a3d1c6be6',
  })
  @ApiOkResponse({
    description: 'User found successfully',
    schema: {
      example: {
        _id: '692722f0fef6975a3d1c6be6',
        email: 'johndoe@gmail.com',
        username: 'john doe',
        avatarUrl: 'null',
        status: 'offline',
        createdAt: '2025-11-26T15:55:28.229Z',
        updatedAt: '2025-11-26T15:55:28.229Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    examples: {
      invalidMongoId: {
        summary: 'invalid mongo ID',
        value: {
          statusCode: 400,
          message: 'Invalid ID format',
          error: 'Bad Request',
        },
      },
      userNotFound: {
        summary: 'User can not be found',
        value: {
          statusCode: 400,
          message: 'User Not Found',
          error: 'Bad Request',
        },
      },
    },
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiParam({
    name: 'id',
    type: String,
    description: 'The mongo Id of the user',
    example: '692722f0fef6975a3d1c6be6',
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: 'User Updated Successfully',
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    examples: {
      invalidMongoId: {
        summary: 'invalid mongo ID',
        value: {
          statusCode: 400,
          message: 'Invalid ID format',
          error: 'Bad Request',
        },
      },
      userNotFound: {
        summary: 'User can not be found',
        value: {
          statusCode: 400,
          message: 'User Not Found',
          error: 'Bad Request',
        },
      },
    },
  })
  @Patch(':id')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiParam({
    name: 'id',
    type: String,
    description: 'The mongo Id if the user',
    example: '692722f0fef6975a3d1c6be6',
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: 'User Deleted Successfully',
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    examples: {
      invalidMongoId: {
        summary: 'invalid mongo ID',
        value: {
          statusCode: 400,
          message: 'Invalid ID format',
          error: 'Bad Request',
        },
      },
      userNotFound: {
        summary: 'User can not be found',
        value: {
          statusCode: 400,
          message: 'User Not Found',
          error: 'Bad Request',
        },
      },
    },
  })
  @Delete(':id')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
