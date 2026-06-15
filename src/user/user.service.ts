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

  async update(id: string, data: Partial<User>) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    return user;
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async delete(id: string) {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findFirst({
      where: { id },
    });
  }

  async findEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email },
    });
  }

  async findByResetToken(token: string) {
    return this.prisma.user.findFirst({
      where: { resetToken: token },
    });
  }

  async findByVerificationToken(token: string) {
    return this.prisma.user.findFirst({
      where: { verificationToken: token },
    });
  }
}
