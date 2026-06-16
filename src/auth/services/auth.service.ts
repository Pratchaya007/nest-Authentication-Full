import {
  BadRequestException,
  Body,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
import { LoginDto } from '../dtos/login-user.dto';
import { MeResponseDto } from '../dtos/me-response.dto';

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
  async verifyEmail(token: string, res: Response) {
    const user = await this.userService.findByVerificationToken(token);

    if (!user || !user.verificationToken) {
      throw new BadRequestException('Invalid verification token');
    }

    if (
      user.verificationTokenExpiresAt &&
      user.verificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        'Verification token has expired. Please request a new one',
      );
    }

    await this.userService.update(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    });

    const tokens = await this.generateToken(user);
    await this.seveRefreshToken(user.id, tokens.refreshToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return {
      message: 'Email verified successfuly. you are now logged in',
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
  async login(loginDto: LoginDto, res: Response) {
    // find in database
    const user = await this.userService.findByEmail(loginDto.email);
    // throw new Error
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    //compare Password user in db
    const isMatch = await this.bcryptServiec.compare(
      loginDto.password,
      user.password,
    );
    // throw error userpassword not password in db
    if (!isMatch)
      throw new UnauthorizedException({
        message: 'The provided email or password is incorrect',
        code: 'Invalid credentials',
      });
    //throw new error user is not verify in email
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before login in',
      );
    }
    // create token
    const accessToken = await this.generateToken(user);
    //seve token in database
    await this.seveRefreshToken(user.id, accessToken.refreshToken);
    //send token in cookie show client sendrequest
    this.setRefreshTokenCookie(res, accessToken.refreshToken);

    return {
      accessToken: accessToken.accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
  async getCurrentUser(id: string): Promise<MeResponseDto> {
    return this.userService.findById(id);
  }
  async refresh(refreshToekn: string, res: Response) {
    //check token
    if (!refreshToekn) {
      throw new UnauthorizedException('No refresh token provided');
    }
    //find jwtrefresh in auth-tokenservice.
    const payload =
      await this.authtokenService.verifyRefreshToken(refreshToekn);
    // find sub.id in database
    const user = await this.userService.findById(payload.sub);

    // ถ้าไม่เจอข้อมูล user and user.refreshToken throw new Error
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    // Compare refreshToken เอามาเปรียบเทียบกันว่าตรงกันไหม
    const tokenMatch = await this.bcryptServiec.compare(
      refreshToekn,
      user.refreshTokenHash,
    );
    // ไม่ตรงส่งอะไรออกไป
    if (!tokenMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const tokens = await this.generateToken(user);
    await this.seveRefreshToken(user.id, tokens.refreshToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
    };
  }
  async logout(userId: string, res: Response) {
    //เข้าไปเคลียร์ค่า refresh in db ==> null
    await this.userService.update(userId, { refreshTokenHash: null });

    res.clearCookie('refresh_token');
    return { message: 'Logout successfully!' };
  }
  async forgotPassword(email: string) {
    // find email in db
    const user = await this.userService.findByEmail(email);
    if (!user)
      throw new BadRequestException('No account found with this email address');

    // Create token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); //1hr

    // updata in database
    await this.userService.update(user.id, {
      resetToken,
      resetTokenExpiresAt,
    });

    // Send Password in Email
    void this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message:
        'If an account with that email existe, a reset link has been sent',
    };
  }
  async resetPassword(token: string, newPassword: string) {
    // find token
    const user = await this.userService.findByResetToken(token);
    // Throw err
    if (!user || !user.resetToken) {
      throw new BadRequestException('Invalid reset token');
    }
    //เช็กว่า resetTokenExpiresAt มีค่าไหม  ถ้ามี และเวลาหมดอายุ น้อยกว่าเวลาปัจจุบัน  แปลว่า Reset Token หมดอายุแล้ว
    if (user.resetTokenExpiresAt && user.resetTokenExpiresAt < new Date()) {
      throw new BadRequestException(
        'Reset token has expired. Please request a new one',
      );
    }
    // Hash New Password
    const password = await this.bcryptServiec.hash(newPassword);

    // Updata in db
    await this.userService.update(user.id, {
      password,
      resetToken: null,
      resetTokenExpiresAt: null,
      refreshTokenHash: null,
    });

    return { message: 'Password reset successfully. You can now log in' };
  }

  //generateToken(user) — คนปั๊มตั๋ว 🎫
  private async generateToken(user: Omit<User, 'password'>) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    //Access Token: ตั๋วใบเล็ก อายุสั้น (เช่น 15 นาที)
    const accessToken = await this.authtokenService.signAccessToken(payload);

    //Refresh Token: ตั๋วใบใหญ่ อายุยาว (เช่น 7 วัน)
    const refreshToken = await this.authtokenService.signRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }
  //SaveRefreshToken ฟังก์ชันนี้ทำหน้าที่บันทึกประวัติการออก Refresh Token ลงฐานข้อมูลเพื่อใช้ตรวจสอบในอนาคต
  private async seveRefreshToken(userId: string, refreshToken: string) {
    const refreshTokenHash = await this.bcryptServiec.hash(refreshToken);
    await this.userService.update(userId, { refreshTokenHash });
  }
  //คนส่งของให้ Client 🚚 ฟังก์ชันนี้มีหน้าที่ส่ง refreshToken กลับไปเก็บไว้ที่ฝั่งเบราว์เซอร์ของผู้ใช้ แต่ส่งผ่านช่องทางพิเศษที่ปลอดภัยที่สุด นั่นคือ HTTP Cookie
  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, //7d
    });
  }
}
