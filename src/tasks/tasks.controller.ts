import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/types/jwt-payload.type';
import { ApiOperation } from '@nestjs/swagger';
import { CreateTaskDto } from './dtos/create-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks for current user ' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.taskService.findAllForUser(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTaskDto) {
    return this.taskService.create(user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updata task' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.taskService.updata(id, user.sub, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.taskService.delete(id, user.sub);
  }
}
