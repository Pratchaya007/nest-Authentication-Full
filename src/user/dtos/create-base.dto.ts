import { Role } from 'src/database/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Trim } from 'src/common/decorators/trim.decorator';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

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

  @ApiProperty({
    example: 'test_09-ooe',
    description: 'A user passwrod. Must have at least 6 characters',
  })
  @Trim()
  @MinLength(6, { message: 'Password must have at least 6 characters' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;

  @ApiProperty({ example: 'Pratchaya' })
  @Trim()
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsEnum(Role, {
    message: 'Gender must be one of th follwing values: USER , ADMIN',
  })
  @IsNotEmpty({ message: 'Role is required' })
  role?: Role;

  isVerified?: boolean;

  verificationToken?: string;

  resetToken?: string;

  refreshTokenHash?: string;

  verificationTokenExpiresAt?: Date;
}
