// GoF Pattern: Factory Method (adapted from LessonFactory)

import { ClassType } from '../schedule-slot.entity';
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

export abstract class BaseScheduleSlot {
  abstract readonly classType: ClassType;

  constructor(public props: ScheduleSlotProps) {}

  abstract getSlotDetails(): string;
}

export class LectureSlot extends BaseScheduleSlot {
  readonly classType = ClassType.LECTURE;

  getSlotDetails(): string {
    return `Лекція: Day ${this.props.dayOfWeek}, ${this.props.startTime}-${this.props.endTime} at ${this.props.location || 'TBD'}. Theoretical material.`;
  }
}

export class LabSlot extends BaseScheduleSlot {
  readonly classType = ClassType.LAB;

  getSlotDetails(): string {
    return `Лабораторна: Day ${this.props.dayOfWeek}, ${this.props.startTime}-${this.props.endTime} at ${this.props.location || 'TBD'}. Practical application.`;
  }
}

export class PracticeSlot extends BaseScheduleSlot {
  readonly classType = ClassType.PRACTICE;

  getSlotDetails(): string {
    return `Практика: Day ${this.props.dayOfWeek}, ${this.props.startTime}-${this.props.endTime} at ${this.props.location || 'TBD'}. Group exercises.`;
  }
}

export class ScheduleSlotFactory {
  static createSlot(type: ClassType, props: ScheduleSlotProps): BaseScheduleSlot {
    switch (type) {
      case ClassType.LECTURE:
        return new LectureSlot(props);
      case ClassType.LAB:
        return new LabSlot(props);
      case ClassType.PRACTICE:
        return new PracticeSlot(props);
      default:
        throw new Error('Invalid class type');
    }
  }
}
