import { IS_PUBLIC_KEY } from '@/decorators/public-route.decorator';
import {
  JwtInvalidTokenException,
  JwtExpiredTokenException,
} from '@/exceptions/jwt.exception';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError, JsonWebTokenError } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        throw new JwtExpiredTokenException(
          'Access token has expired. Please reset your access token',
        );
      } else if (info instanceof JsonWebTokenError) {
        throw new JwtInvalidTokenException(
          'Access token is invalid. Please login again',
        );
      } else {
        throw new UnauthorizedException(
          'Access token is missing. Please login again',
        );
      }
    }
    return user;
  }
}
