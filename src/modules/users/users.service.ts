import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { hashPassword } from '@/common/utils/bcrypt';
import bmq from '@/common/utils/bmq';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  publicField: string[] = [
    '_id',
    'name',
    'email',
    'role',
    'createdAt',
    'updatedAt',
  ];

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, phone, address, avatar } = createUserDto;

    const isEmailExist = await this.userModel.findOne({ email });
    if (isEmailExist) {
      throw new BadRequestException(
        'Email already exists! Please use another email',
      );
    }

    const hashPw = hashPassword(password);

    const newUser = await this.userModel.create({
      name,
      email,
      password: hashPw,
      phone,
      address,
      avatar,
    });

    return {
      _id: newUser._id,
    };
  }

  async findAll(query: object = {}) {
    const { limit, skip, filter, projection, sort } = bmq(query);

    const totalItems = await this.userModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    const users = await this.userModel
      .find(filter)
      .select(projection || this.publicField)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();

    return {
      users,
      metadata: {
        totalItems,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    const user = await this.userModel
      .findOne({ _id: id })
      .select(this.publicField)
      .lean();

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async findByName(name: string) {
    const user = await this.userModel
      .findOne({
        name,
      })
      .select(this.publicField);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userModel
      .findOne({
        email,
      })
      .select(this.publicField)
      .lean();

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async findPasswordByEmail(email: string) {
    const user = await this.userModel.findOne({ email }).lean();
    return user.password;
  }

  async update(updateUserDto: UpdateUserDto) {
    const { _id, name, phone, address, avatar } = updateUserDto;

    const updatedUser = await this.userModel.updateOne(
      {
        _id,
      },
      {
        name,
        phone,
        address,
        avatar,
      },
    );

    if (updatedUser.matchedCount === 0) {
      throw new BadRequestException('User not found');
    }

    if (updatedUser.modifiedCount === 0) {
      throw new BadRequestException('User not updated');
    }

    return {
      _id,
    };
  }
}
