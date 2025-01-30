import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  Response,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from '@/decorators/public-route.decorator';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { ResponseMessage } from '@/decorators/response-message.decorator';
import { RefreshTokenGuard } from './passport/refresh-token-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from '@/pipes/image-validation';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CloudinaryService } from '@/modules/cloudinary/cloudinary.service';
import { UploadFileFormatOptions, UploadFileOptions } from '@/interfaces';
import { v4 as uuid } from 'uuid';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cloudinaryService: CloudinaryService,
  ) {}

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
  @UseInterceptors(FileInterceptor('avatar'))
  async register(
    @Body() signupAuthDto: SignupAuthDto,
    @UploadedFile(new ImageValidationPipe()) avatar: Express.Multer.File,
  ) {
    if (avatar) {
      const format: UploadFileFormatOptions = {
        width: 150,
        height: 150,
        crop: 'fill',
      };

      const options: UploadFileOptions = {
        public_id: uuid(),
        folder: 'cm3/avatar',
      };

      const avatarUrl = await this.cloudinaryService.uploadFile(
        avatar,
        options,
        format,
      );

      if (avatarUrl) {
        signupAuthDto.avatar = avatarUrl;
      }
    }

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

  @Post('update-profile')
  @ResponseMessage('Update profile successfully')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Request() req,
    @Body() body: UpdateProfileDto,
    @UploadedFile(new ImageValidationPipe()) avatar: Express.Multer.File,
  ) {
    let res = await this.cloudinaryService.uploadFile(avatar);

    console.log(res);

    return {
      msg: 'OK',
    };
    return this.authService.updateProfile(req.user._id, body);
  }
}
