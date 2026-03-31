// File: src/schedule/presentation/update-schedule-slot.dto.ts
import { IsString, IsOptional, IsInt, IsEnum, Min, Max } from 'class-validator';
import { ClassType } from '../domain/schedule-slot.entity';

export class UpdateScheduleSlotDto {
  @IsString()
  @IsOptional()
  subjectId?: string;

  @IsString()
  @IsOptional()
  teacherId?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(2)
  weekNumber?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(7)
  dayOfWeek?: number;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsEnum(ClassType)
  @IsOptional()
  classType?: ClassType;

  @IsString()
  @IsOptional()
  location?: string;
}
