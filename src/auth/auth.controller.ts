import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { RegisterDto } from './dtos/register-user.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { LoginDto } from './dtos/login-user.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from 'src/types/jwt-payload.type';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { MeResponseDto } from './dtos/me-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/register
  @Public()
  @Post('register')
  async register(@Body() register: RegisterDto) {
    return this.authService.create(register);
  }

  // GET /api/auth/verify-email?token=....
  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email address and auto-login' })
  async verifyEmail(
    @Query('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyEmail(token, res);
  }

  // POST /api/auth/login
  @Public()
  @ApiOperation({ summary: 'Login and receive access + refresh tokens' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginDto, res);
  }

  // GET /api/auth/me
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: MeResponseDto, excludeExtraneousValues: true })
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authorization user' })
  async getMe(@CurrentUser() user: JwtPayload): Promise<MeResponseDto> {
    return this.authService.getCurrentUser(user.sub);
  }

  // POST /api/auth/refresh
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    // @Req() req อ่านข้อมูลที่ Client ส่งมา
    // @Res() res จัดการ Response เองทั้งหมด
  ) {
    // ดึง Refresh Token จาก Cookie แล้วส่งไปให้ Service เพื่อตรวจสอบและออก Token ใหม่ให้ผู้ใช้.
    const cookies = req.cookies as Record<string, string>;
    const refreshToken = cookies.refresh_token;
    return this.authService.refresh(refreshToken, res);
  }

  // POST /api/auth/logout
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @Post('logout')
  async logout(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(user.sub, res);
  }

  // POST /api/auth/forgot-password
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  // POST /api/auth/reset-password
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }
}
