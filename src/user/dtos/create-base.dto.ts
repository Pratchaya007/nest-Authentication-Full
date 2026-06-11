import { Role } from 'src/database/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Trim } from 'src/common/decorators/trim.decorator';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateBaseDto {
  @ApiProperty({
    example: 'a@gamil.com',
    description: 'An email address to be registerd. Must be unique',
  })
  @Trim()
  @IsEmail({}, { message: 'Invalid email address' })
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  passwordHash!: string;

  name!: string;

  role!: Role;

  isVerified!: boolean;

  verificationToken?: string;

  resetToken?: string;

  refreshTokenHash?: string;
}
