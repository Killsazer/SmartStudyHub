// File: src/presentation/dtos/update-task-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '../../domain/entities/task.entity';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status: TaskStatus;
}
