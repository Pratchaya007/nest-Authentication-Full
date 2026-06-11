import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { TypedConfigService } from 'src/config/typed-config.service';
import { PrismaClient } from 'src/database/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly typConfigService: TypedConfigService) {
    const adapter = new PrismaPg({
      connectionString: typConfigService.get('DATABASE_URL'),
    });
    super({ adapter });
  }
}
