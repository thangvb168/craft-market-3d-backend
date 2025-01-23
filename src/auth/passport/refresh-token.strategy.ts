import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/modules/users/users.service';
import { TokensService } from '@/modules/tokens/tokens.service';
import { JwtInvalidTokenException } from '@/exceptions/jwt.exception';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private tokensService: TokensService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) =>
          RefreshTokenStrategy.cookieExtractor(req, 'refresh_token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.cookies['refresh_token'];

    const [isMatch, user] = await Promise.all([
      this.tokensService.compareRefreshToken(payload.sub, refreshToken),
      this.usersService.findOne(payload.sub),
    ]);

    if (!isMatch)
      throw new JwtInvalidTokenException(
        'Refresh token is invalid. Please login again',
      );

    if (!user) throw new BadRequestException('User not found');

    return { _id: user._id, email: user.email, role: user.role };
  }

  private static cookieExtractor(req: Request, name: string) {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies[name];
    }
    return token;
  }
}
