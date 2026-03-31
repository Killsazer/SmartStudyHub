// File: src/schedule/domain/schedule-slot.repository.interface.ts
import { ScheduleSlotEntity } from './schedule-slot.entity';

export interface IScheduleSlotRepository {
  save(slot: ScheduleSlotEntity): Promise<void>;
  update(id: string, data: Partial<{
    subjectId: string;
    teacherId: string | null;
    weekNumber: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    classType: string;
    location: string | null;
  }>): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<ScheduleSlotEntity | null>;
  findByUserId(userId: string): Promise<ScheduleSlotEntity[]>;
  findByUserIdAndWeek(userId: string, weekNumber: number): Promise<ScheduleSlotEntity[]>;
}
