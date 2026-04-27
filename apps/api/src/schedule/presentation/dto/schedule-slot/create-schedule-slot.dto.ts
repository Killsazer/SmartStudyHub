import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, Min, Max, Matches } from 'class-validator';
import { ClassType } from '../../../domain/schedule-slot.entity';

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
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be a valid time in HH:MM format',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be a valid time in HH:MM format',
  })
  endTime: string;

  @IsEnum(ClassType)
  classType: ClassType;

  @IsString()
  @IsOptional()
  location?: string;
}
