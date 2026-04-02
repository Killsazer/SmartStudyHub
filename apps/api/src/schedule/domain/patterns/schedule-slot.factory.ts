import { ClassType, ScheduleSlotEntity, ScheduleSlotProps } from '../entities/schedule-slot.entity';

export class LectureSlot extends ScheduleSlotEntity {
  readonly classType = ClassType.LECTURE;

  getSlotDetails(): string {
    return `Лекція: Day ${this.dayOfWeek}, ${this.startTime}-${this.endTime} at ${this.location || 'TBD'}. Theoretical material.`;
  }
}

export class LabSlot extends ScheduleSlotEntity {
  readonly classType = ClassType.LAB;

  getSlotDetails(): string {
    return `Лабораторна: Day ${this.dayOfWeek}, ${this.startTime}-${this.endTime} at ${this.location || 'TBD'}. Practical application.`;
  }
}

export class PracticeSlot extends ScheduleSlotEntity {
  readonly classType = ClassType.PRACTICE;ʼ

  getSlotDetails(): string {
    return `Практика: Day ${this.dayOfWeek}, ${this.startTime}-${this.endTime} at ${this.location || 'TBD'}. Group exercises.`;
  }
}

export class ScheduleSlotFactory {
  static createSlot(type: ClassType, props: ScheduleSlotProps): ScheduleSlotEntity {
    switch (type) {
      case ClassType.LECTURE:
        return new LectureSlot(props);
      case ClassType.LAB:
        return new LabSlot(props);
      case ClassType.PRACTICE:
        return new PracticeSlot(props);
      default:
        throw new Error(`Invalid class type: ${type}`);
    }
  }
}