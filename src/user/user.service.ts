import { Injectable } from '@nestjs/common';
import { User } from 'src/database/generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { CreateBaseDto } from './dtos/create-base.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateBaseDto): Promise<User> {
    const user = await this.prisma.user.create({
      data: data,
    });
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
