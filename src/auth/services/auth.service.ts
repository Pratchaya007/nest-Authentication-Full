import { Body, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { RegisterDto } from '../dtos/register-user.dto';
import { UserService } from 'src/user/user.service';
import { BcryptService } from 'src/shared/security/services/bcrypt.service';
import { TypedConfigService } from 'src/config/typed-config.service';
import crypto from 'crypto';
import { EmailService } from './email.service';
import { User } from 'src/database/generated/prisma/client';
import { AuthTokenService } from 'src/shared/security/services/auth-token.service';
import { JwtPayload } from 'src/types/jwt-payload.type';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly bcryptServiec: BcryptService,
    private readonly typedConfigService: TypedConfigService,
    private readonly emailService: EmailService,
    private readonly authtokenService: AuthTokenService,
  ) {}

  async create(regiterDto: RegisterDto) {
    //ค้นหาก่อนเลยมี Email ใน db ไหม
    const user = await this.userService.findByEmail(regiterDto.email);

    // เช็คว่าเจอไหมใน db
    if (user) {
      throw new ConflictException('An account with this email already exists');
    }

    // Hash Password
    const isMatch = await this.bcryptServiec.hash(regiterDto.password);

    // create verificationToken
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000, // 24 hr
    );

    //insert to db
    const createUser = await this.userService.create({
      email: regiterDto.email,
      password: isMatch,
      name: regiterDto.name,
      verificationToken,
      verificationTokenExpiresAt,
    });

    void this.emailService.sendVerificationEamil(
      createUser.email,
      verificationToken,
    );

    return {
      message:
        'Registration Successful. Please check your email to verify your account',
    };
  }

  // Generate Token and fefreshToken
  private async generateToken(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.authtokenService.signAccessToken(payload);

    const refreshToken = await this.authtokenService.signRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }
  // SaveRefreshToken
  private async seveRefreshToken(userId: string, refreshToken: string) {
    const refreshTokenHash = await this.bcryptServiec.hash(refreshToken);
    await this.userService.update(userId, { refreshTokenHash });
  }
  // SetRefreshTokenCookie
  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, //7d
    });
  }
}
