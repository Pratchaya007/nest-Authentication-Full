import { Injectable } from '@nestjs/common';
import { TypedConfigService } from 'src/config/typed-config.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/types/jwt-payload.type';
import type { StringValue } from 'ms';

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly typedConfigService: TypedConfigService,
    private readonly jwtService: JwtService, //อย่าลืม import JwtModule ใช้งานสร้าง Token
  ) {}

  signAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.typedConfigService.get('JWT_SECRET'),
      expiresIn: this.typedConfigService.get('JWT_EXPIRES_IN') as StringValue,
    });
  }

  signRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.typedConfigService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.typedConfigService.get(
        'JWT_REFRESH_EXPIRES_IN',
      ) as StringValue,
    });
  }

  verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: this.typedConfigService.get('JWT_SECRET'),
    });
  }

  verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: this.typedConfigService.get('JWT_REFRESH_SECRET'),
    });
  }
}

//pnpm i ms and pnpm add -D @types/ms ====> StringValue
