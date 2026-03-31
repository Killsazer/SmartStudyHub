// File: src/schedule/presentation/create-schedule-slot.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, Min, Max } from 'class-validator';
import { ClassType } from '../domain/entities/schedule-slot.entity';

export class CreateScheduleSlotDto {
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsOptional()
  teacherId?: string;

  @IsInt()
  @Min(1)
  @Max(2)
  weekNumber: number;

  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek: number;

  @IsString()
  @IsNotEmpty()
  startTime: string;  // "HH:MM"

  @IsString()
  @IsNotEmpty()
  endTime: string;    // "HH:MM"

  @IsEnum(ClassType)
  classType: ClassType;

  @IsString()
  @IsOptional()
  location?: string;
}
