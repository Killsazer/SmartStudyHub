import { ClassType } from '@studyhub/shared-types';

export { ClassType };

export interface ScheduleSlotProps {
  id: string;
  userId: string;
  subjectId: string;
  teacherId: string | null;
  weekNumber: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
}

export abstract class ScheduleSlotEntity {
  public readonly id: string;
  public readonly userId: string;
  public subjectId: string;
  public teacherId: string | null;
  public weekNumber: number;
  public dayOfWeek: number;
  public startTime: string;
  public endTime: string;
  public location?: string;

  abstract readonly classType: ClassType;

  constructor(props: ScheduleSlotProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.subjectId = props.subjectId;
    this.teacherId = props.teacherId;
    this.weekNumber = props.weekNumber;
    this.dayOfWeek = props.dayOfWeek;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.location = props.location;
  }

  abstract getSlotDetails(): string;
}