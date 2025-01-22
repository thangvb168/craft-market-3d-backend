import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage } from '@/decorators/response-message.decorator';
import { Roles } from '@/decorators/roles.decorator';
import { Role } from '@/common/constants';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage('Create new user successfully')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @Roles([Role.Admin])
  @ResponseMessage('Get users successfully')
  async findAll(@Query() query: object) {
    return await this.usersService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage('Get user successfully')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Patch()
  @ResponseMessage('Update user successfully')
  async update(@Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(updateUserDto);
  }

  @Delete()
  async remove(@Param('id') id: string) {
    throw new BadRequestException('You dont have permission to delete user!');
  }
}
