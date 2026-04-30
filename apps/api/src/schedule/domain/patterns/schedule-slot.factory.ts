import { ClassType, ScheduleSlotEntity, ScheduleSlotProps } from '../schedule-slot.entity';
import { SlotValidationError } from './slot-validation.error';

export { ClassType, ScheduleSlotEntity };

export class LectureSlot extends ScheduleSlotEntity {
  readonly classType = ClassType.LECTURE;
}

export class LabSlot extends ScheduleSlotEntity {
  readonly classType = ClassType.LAB;

  override validate(): void {
    if (!this.teacherId) {
      throw new SlotValidationError('Lab slots require an assigned teacher.');
    }
  }
}

export class PracticeSlot extends ScheduleSlotEntity {
  readonly classType = ClassType.PRACTICE;
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
