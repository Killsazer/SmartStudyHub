// GoF Pattern: Builder — adapted for new schedule-centric model
import { SubjectEntity } from '../subject.entity';
import { BaseScheduleSlot } from '../../../schedule/domain/patterns/schedule-slot.factory';
import { TaskEntity } from '../../../tasks/domain/task.entity';

export class SubjectBuilder {
  private subject: SubjectEntity;

  constructor(id: string, title: string, userId: string) {
    this.subject = new SubjectEntity(id, title, userId);
    this.subject.scheduleSlots = this.subject.scheduleSlots || [];
    this.subject.tasks = this.subject.tasks || [];
  }

  setColor(color: string): SubjectBuilder {
    this.subject.color = color;
    return this;
  }

  addScheduleSlot(slot: BaseScheduleSlot): SubjectBuilder {
    this.subject.scheduleSlots.push(slot);
    return this;
  }

  addTask(task: TaskEntity): SubjectBuilder {
    this.subject.tasks.push(task);
    return this;
  }

  build(): SubjectEntity {
    return this.subject;
  }
}
