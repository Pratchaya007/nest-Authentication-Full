import { Module } from '@nestjs/common';
import { TypedConfigService } from './typed-config.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validate } from './env.validation';

@Module({
  imports: [
    NestConfigModule.forRoot({
      validate: validate,
    }),
  ],
  providers: [TypedConfigService],
})
export class ConfigModule {}
