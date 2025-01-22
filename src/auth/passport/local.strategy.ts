import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // ! Default usernameField is 'username', so i need to change it to 'email'
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'pending') {
      throw new UnauthorizedException('Please verify your email address');
    } else if (user.status === 'blocked') {
      throw new UnauthorizedException('Your account has been blocked');
    }

    return user;
  }
}
