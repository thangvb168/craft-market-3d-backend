import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from '@/common/utils/bcrypt';
import { ConfigService } from '@nestjs/config';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { RefreshAuthDto } from './dto/refresh-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
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
    return {
      user,
      tokens: {
        accessToken: await this.jwtService.signAsync(payload, {
          expiresIn: this.configService.get<string>(
            'JWT_ACCESS_TOKEN_EXPIRES_IN',
          ),
          secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        }),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: this.configService.get<string>(
            'JWT_REFRESH_TOKEN_EXPIRES_IN',
          ),
          secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        }),
      },
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

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_TOKEN_EXPIRES_IN',
        ),
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      }),
    };
  }
}
