import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/database/generated/prisma/enums';

export const ROLES_KEY = Symbol('ROLES');

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
