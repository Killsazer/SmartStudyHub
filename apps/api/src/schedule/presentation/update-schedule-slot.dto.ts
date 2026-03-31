// File: src/schedule/presentation/update-schedule-slot.dto.ts
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

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

  @IsString()
  @IsOptional()
  classType?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
