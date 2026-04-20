import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '../../domain/task.entity';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status: TaskStatus;
}
