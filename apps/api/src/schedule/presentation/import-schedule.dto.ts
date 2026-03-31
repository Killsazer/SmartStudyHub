// File: src/schedule/presentation/import-schedule.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class ImportScheduleDto {
  @IsString()
  @IsNotEmpty()
  hashToken: string;
}
