import { Injectable } from '@nestjs/common';
import { EnvConfigType } from './env.validation';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TypedConfigService {
  constructor(
    private readonly configService: ConfigService<EnvConfigType, true>,
  ) {}

  get<K extends keyof EnvConfigType>(key: K): EnvConfigType[K] {
    return this.configService.get(key, { infer: true });
  }
}
