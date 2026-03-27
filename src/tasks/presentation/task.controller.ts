// File: src/tasks/presentation/task.controller.ts
import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TaskService } from '../application/task.service';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskStatusDto } from './update-task-status.dto';
import { JwtAuthGuard } from '../../shared/security/jwt-auth.guard';
import { CurrentUser } from '../../shared/security/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async createTask(
    @CurrentUser() userId: string,
    @Body() dto: CreateTaskDto
  ) {
    const task = await this.taskService.createTask(userId, dto);
    return { status: 'success', data: { id: task.id, title: task.title } };
  }

  @Patch(':id/status')
  async updateTaskStatus(
    @Param('id') taskId: string,
    @Body() dto: UpdateTaskStatusDto
  ) {
    await this.taskService.changeTaskStatus(taskId, dto.status);
    return { status: 'success', message: `Task status securely updated to ${dto.status}` };
  }

  @Get()
  async getUserTasks(
    @CurrentUser() userId: string,
    @Query('sort') sortType?: string
  ) {
    const tasks = await this.taskService.getUserTasks(userId, sortType);
    return { status: 'success', data: tasks };
  }
}
