import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/role.decorator';
import { Role } from 'src/database/generated/prisma/enums';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!roles) return true;

    //ไปดึงค่าจาก req ขอว user มา
    const request = context.switchToHttp().getRequest<Request>();
    const userRole = request.user?.role; // ดึงข้อมูลใน user in current เรามาใช้งาน

    // check in token
    if (!userRole) throw new Error('Role connot user without authorization');

    // check in controller. where is Token ?
    if (!roles.includes(userRole))
      throw new ForbiddenException(
        'Insufficient permission to perform this action',
      );
    return true;
  }
}
