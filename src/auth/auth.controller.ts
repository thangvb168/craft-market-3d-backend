import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from '@/decorators/public-route.decorator';
import { SignupAuthDto } from './dto/signup-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  async register(@Body() signupAuthDto: SignupAuthDto) {
    return this.authService.register(signupAuthDto);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
