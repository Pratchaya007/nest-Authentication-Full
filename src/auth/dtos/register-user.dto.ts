import { OmitType } from '@nestjs/swagger';
import { CreateBaseDto } from 'src/user/dtos/create-base.dto';

export class RegisterDto extends OmitType(CreateBaseDto, [
  'resetToken',
  'refreshTokenHash',
  'verificationToken',
]) {}
