import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  Response,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from '@/decorators/public-route.decorator';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { ResponseMessage } from '@/decorators/response-message.decorator';
import { RefreshTokenGuard } from './passport/refresh-token-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @ResponseMessage('Login successfully')
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Response({ passthrough: true }) res) {
    const { user, tokens } = await this.authService.login(req.user);

    console.log('Tokens:', tokens);

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      path: '/api/v1/auth/refresh',
    });

    return user;
  }

  @Public()
  @ResponseMessage('Register successfully')
  @Post('register')
  async register(@Body() signupAuthDto: SignupAuthDto) {
    return this.authService.register(signupAuthDto);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @ResponseMessage('Refresh token successfully')
  @Post('refresh')
  async refresh(
    @Request() req,
    @Body() body,
    @Response({ passthrough: true }) res,
  ) {
    const tokens = await this.authService.refreshToken({
      verifiedId: body.id,
      id: req.user._id.toString(),
      email: req.user.email,
    });

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
    });

    return {
      success: true,
    };
  }

  @Post('logout')
  @ResponseMessage('Logout successfully')
  async logout(@Request() req, @Response({ passthrough: true }) res) {
    await this.authService.logout(req.user._id);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token', {
      path: '/api/v1/auth/refresh',
    });

    return {
      success: true,
    };
  }

  @Public()
  @Post('verify-email')
  @ResponseMessage('Verify email successfully')
  async verifyEmail(@Body() body) {
    return this.authService.verifyEmail(body);
  }

  @Public()
  @Post('renew-token')
  @ResponseMessage('Renew token successfully')
  async renewToken(@Body() body) {
    return this.authService.renewToken(body.email);
  }

  @Get('profile')
  @ResponseMessage('Get profile successfully')
  getProfile(@Request() req) {
    return req.user;
  }
}
