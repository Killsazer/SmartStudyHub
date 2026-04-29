import { IsString, IsOptional, MaxLength, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { TaskPriority } from '../../domain/task.entity';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsNumber()
  @IsOptional()
  recurrenceDays?: number;
}
