import { Expose } from 'class-transformer';
import { Role } from 'src/database/generated/prisma/enums';

export class MeResponseDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  name!: string;

  @Expose()
  role!: Role;

  @Expose()
  isVerified!: boolean;
}
