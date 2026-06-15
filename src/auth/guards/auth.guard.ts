import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthTokenService } from 'src/shared/security/services/auth-token.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Request } from 'express';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authTokenService: AuthTokenService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get data header in controllers ?
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    // true and false
    if (isPublic) return true;

    // get Requst
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractJwtFromHeader(request);

    // thorw new error is not authorization
    if (!token) {
      throw new BadRequestException({
        message: 'Authorization is required, expected: Bearer authorization',
        code: 'INVALID_ATUHORIZATION',
      });
    }

    try {
      const payload = await this.authTokenService.verifyAccessToken(token);
      request.user = payload;
    } catch (error) {
      if (error instanceof JsonWebTokenError)
        throw new UnauthorizedException({
          message: 'Invalid token',
          code: 'INVALID_TOKEN',
        });
      if (error instanceof TokenExpiredError)
        throw new UnauthorizedException({
          message: 'token has expired',
          code: 'TOKEN_EXPIRED',
        });
    }
    return true;
  }

  private extractJwtFromHeader(request: Request): string | undefined {
    const [bearer, token] = request.headers.authorization?.split(' ') ?? [];
    return bearer !== 'Bearer' || !token ? undefined : token;
  }
}
