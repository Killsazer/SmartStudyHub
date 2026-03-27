// File: src/tasks/presentation/update-task-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '../domain/task.entity';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status: TaskStatus;
}
