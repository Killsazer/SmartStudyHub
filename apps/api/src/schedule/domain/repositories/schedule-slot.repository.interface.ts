import { ClassType, ScheduleSlotEntity } from '../schedule-slot.entity';

export type UpdateScheduleSlotData = Partial<{
  subjectId: string;
  teacherId: string | null;
  weekNumber: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classType: ClassType;
  location: string | null;
}>;

export interface IScheduleSlotRepository {
  save(slot: ScheduleSlotEntity): Promise<ScheduleSlotEntity>;
  update(id: string, data: UpdateScheduleSlotData): Promise<ScheduleSlotEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<ScheduleSlotEntity | null>;
  findByUserId(userId: string): Promise<ScheduleSlotEntity[]>;
  findByUserIdAndWeek(userId: string, weekNumber: number): Promise<ScheduleSlotEntity[]>;
}
