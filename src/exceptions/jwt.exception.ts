import { UnauthorizedException } from '@nestjs/common';

export class JwtInvalidTokenException extends UnauthorizedException {
  constructor(msg: string) {
    super(msg, 'InvalidToken');
  }
}

export class JwtExpiredTokenException extends UnauthorizedException {
  constructor(msg: string) {
    super(msg, 'ExpiredToken');
  }
}
