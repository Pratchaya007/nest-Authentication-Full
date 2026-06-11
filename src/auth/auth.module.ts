import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { UserModule } from 'src/user/user.module';
import { SecurityModule } from 'src/shared/security/security.module';
import { EmailService } from './services/email.service';

@Module({
  imports: [UserModule, SecurityModule],
  controllers: [AuthController],
  providers: [AuthService, EmailService],
})
export class AuthModule {}
