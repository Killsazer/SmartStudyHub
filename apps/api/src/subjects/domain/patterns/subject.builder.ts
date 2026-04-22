import { ScheduleSlotEntity } from '../../../schedule/domain/entities/schedule-slot.entity';
import { TaskEntity } from '../../../tasks/domain/task.entity';
import { SubjectEntity } from '../subject.entity';

export class SubjectBuilder {
  private subject: SubjectEntity;

  constructor(id: string, title: string, userId: string) {
    this.subject = new SubjectEntity(id, title, userId);
  }

  setColor(color: string): SubjectBuilder {
    const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
    if (!hexRegex.test(color)) {
      throw new Error(`Invalid color format: ${color}. Must be a valid HEX.`);
    }
    this.subject.color = color;
    return this;
  }

  addScheduleSlot(slot: ScheduleSlotEntity): SubjectBuilder {
    this.subject.scheduleSlots.push(slot);
    return this;
  }

  addTask(task: TaskEntity): SubjectBuilder {
    this.subject.tasks.push(task);
    return this;
  }

  // Фінальний метод Builder. Очищає внутрішній стан після побудови, щоб уникнути мутацій.
  build(): SubjectEntity {
    const result = this.subject;
    // Захист від повторного використання того самого білдера (скидаємо стан)
    this.subject = new SubjectEntity(result.id, result.title, result.userId);
    return result;
  }
}
