import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { SecurityModule } from './shared/security/security.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    DatabaseModule,
    UserModule,
    SecurityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
