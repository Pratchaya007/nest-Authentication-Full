import { Module } from '@nestjs/common';
import { BcryptService } from './services/bcrypt.service';

@Module({
  providers: [BcryptService]
})
export class SecurityModule {}
