import {
  JwtExpiredTokenException,
  JwtInvalidTokenException,
} from '@/exceptions/jwt.exception';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err, user, info) {
    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        throw new JwtExpiredTokenException(
          'Refresh token has expired. Please login again',
        );
      } else if (info instanceof JsonWebTokenError) {
        throw new JwtInvalidTokenException(
          'Refresh token is invalid. Please login again',
        );
      } else {
        throw new UnauthorizedException(
          'Refresh token is missing. Please login again',
        );
      }
    }
    return user;
  }
}
