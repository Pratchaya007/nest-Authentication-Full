import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { SecurityModule } from './shared/security/security.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { RoleGuard } from './auth/guards/role.guard';
import { TasksModule } from './tasks/tasks.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    DatabaseModule,
    UserModule,
    SecurityModule,
    TasksModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
