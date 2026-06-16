import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateTaskDto } from './dtos/create-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}
  async findAllForUser(userId: string) {
    return this.prisma.tasks.findMany({
      where: { userId },
    });
  }

  async create(userId: string, dto: CreateTaskDto) {
    const task = await this.prisma.tasks.create({
      data: { ...dto, userId },
    });
    return task;
  }

  async updata(id: string, userId: string, data: Partial<CreateTaskDto>) {
    const task = await this.prisma.tasks.findFirst({ where: { id } });

    if (!task) throw new NotFoundException('Task not found');

    if (task.userId !== userId) {
      throw new ForbiddenException('You do not own this task');
    }

    const update = await this.prisma.tasks.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return update;
  }

  async delete(id: string, userId: string) {
    const task = await this.prisma.tasks.findFirst({
      where: { id },
    });
    if (!task) throw new NotFoundException('Task not found');

    if (task.userId !== userId) {
      throw new ForbiddenException('You do not own this task');
    }

    await this.prisma.tasks.delete({ where: { id } });

    return { message: 'Task delete successfully!' };
  }
}
