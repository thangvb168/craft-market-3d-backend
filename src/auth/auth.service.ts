import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { comparePassword } from '@/common/utils/bcrypt';
import { ConfigService } from '@nestjs/config';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { RefreshAuthDto } from './dto/refresh-auth.dto';
import { VerifyEmailDto } from './dto/verify-email-auth.dto';
import * as dayjs from 'dayjs';
import { TokensService } from '@/modules/tokens/tokens.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private tokensService: TokensService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const password = await this.usersService.findPasswordByEmail(email);
    const isMatch = await comparePassword(pass, password);
    if (isMatch) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };

    const tokens = await this.tokensService.generatePairToken(payload);

    return {
      user,
      tokens,
    };
  }

  async register(signupAuthDto: SignupAuthDto) {
    return await this.usersService.handleRegister(signupAuthDto);
  }

  async refreshToken(refreshAuthDto: RefreshAuthDto) {
    const { verifiedId, id, email } = refreshAuthDto;

    if (verifiedId !== id) {
      throw new BadRequestException('Invalid refresh token');
    }

    const payload = { email, sub: id };

    const accessToken = await this.tokensService.generateAccessToken(payload);

    return {
      accessToken,
    };
  }

  async renewToken(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.status !== 'pending') {
      throw new BadRequestException('User already activated');
    }

    await this.usersService.renewTokenByEmail(email);

    return {
      success: true,
    };
  }

  async verifyEmail({ email, token }: VerifyEmailDto) {
    const existUser = await this.usersService.findByEmail(email);
    if (!existUser) {
      throw new BadRequestException('User not found');
    }

    if (existUser.status !== 'pending') {
      throw new BadRequestException('User already activated');
    }

    const existToken = await this.usersService.findTokenByEmail(email);

    if (dayjs().isAfter(dayjs(existToken.codeExpired))) {
      throw new BadRequestException('Token expired');
    }

    if (existToken.codeId !== token) {
      throw new BadRequestException('Invalid token');
    }

    const updatedUser = await this.usersService.activeAccountByEmail(email);

    return updatedUser;
  }

  async logout(userId: string) {
    await this.tokensService.deleteToken(userId);
  }
}
