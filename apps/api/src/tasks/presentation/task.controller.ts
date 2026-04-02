import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TaskService } from '../application/task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
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
    // 💡 Повертаємо повний об'єкт, фронтенд скаже "Дякую!"
    return { status: 'success', data: task };
  }

  @Patch(':id/status')
  async updateTaskStatus(
    @CurrentUser() userId: string,
    @Param('id') taskId: string,
    @Body() dto: UpdateTaskStatusDto
  ) {
    await this.taskService.updateTaskStatus(userId, taskId, dto.status);
    return { status: 'success', message: `Task status securely updated to ${dto.status}` };
  }

  @Patch(':id')
  async updateTask(
    @CurrentUser() userId: string,
    @Param('id') taskId: string,
    @Body() dto: UpdateTaskDto
  ) {
    const task = await this.taskService.updateTask(userId, taskId, dto);
    // 💡 Повертаємо повний об'єкт
    return { status: 'success', data: task };
  }

  @Delete(':id')
  async deleteTask(
    @CurrentUser() userId: string,
    @Param('id') taskId: string
  ) {
    await this.taskService.deleteTask(userId, taskId);
    return { status: 'success', message: 'Task deleted successfully' };
  }

  @Get()
  async getUserTasks(
    @CurrentUser() userId: string,
    @Query('sort') sortType?: string,
    @Query('subjectId') subjectId?: string
  ) {
    const tasks = await this.taskService.getUserTasks(userId, sortType, subjectId);
    return { status: 'success', data: tasks };
  }
}