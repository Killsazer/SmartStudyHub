// File: src/presentation/controllers/task.controller.ts
import { Controller, Post, Patch, Body, Param } from '@nestjs/common';
import { TaskService } from '../../application/services/task.service';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskStatusDto } from '../dtos/update-task-status.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async createTask(
    @Body('userId') userId: string,
    @Body() dto: CreateTaskDto
  ) {
    if (!userId) return { status: 400, message: 'userId is required' };
    
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
}
