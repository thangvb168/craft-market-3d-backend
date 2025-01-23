import { PayLoadJwt } from '@/interfaces';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Token } from './schemas/token.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TokensService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    @InjectModel(Token.name) private tokenModel: Model<Token>,
  ) {}

  async generatePairToken(payload: PayLoadJwt) {
    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    await this.saveToken({
      userId: payload.sub,
      refreshToken,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateAccessToken(payload: PayLoadJwt) {
    return await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async generateRefreshToken(payload: PayLoadJwt) {
    return await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN'),
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
    });
  }

  async saveToken({ userId, refreshToken }) {
    const existingToken = await this.tokenModel.findOne({ userId });

    if (existingToken) {
      const oldRefreshToken = existingToken.refreshToken;
      await this.tokenModel.updateOne(
        { userId },
        {
          refreshToken,
          // Save the old refresh token to the database
        },
      );
    } else {
      await this.tokenModel.create({
        userId,
        refreshToken,
      });
    }
  }

  async deleteToken(userId: string) {
    await this.tokenModel.deleteOne({ userId });
  }

  async compareRefreshToken(userId: string, refreshToken: string) {
    const existToken = await this.tokenModel.findOne({ userId });

    if (!existToken) {
      return false;
    }

    return existToken.refreshToken === refreshToken;
  }
}
