/**
 * ====================================================================
 * Патерн: Builder (Породжувальний / Creational)
 * ====================================================================
 * Дозволяє покроково збирати складний об'єкт SubjectEntity,
 * додаючи до нього розклад, завдання та налаштування кольору.
 * Це зручніше за конструктор із 10+ параметрами — Builder дозволяє
 * конструювати різні конфігурації об'єкта через fluent-інтерфейс.
 *
 * Ключові ознаки патерну:
 * - Методи повертають `this` для ланцюгових викликів (fluent API)
 * - Фінальний метод `build()` повертає готовий об'єкт
 * ====================================================================
 */
import { SubjectEntity } from '../subject.entity';

export class SubjectBuilder {
  /** Внутрішній об'єкт, що поступово наповнюється через fluent-методи */
  private subject: SubjectEntity;

  constructor(id: string, title: string, userId: string) {
    this.subject = new SubjectEntity(id, title, userId);
    this.subject.scheduleSlots = this.subject.scheduleSlots || [];
    this.subject.tasks = this.subject.tasks || [];
  }

  /** Крок Builder: задає колір предмета */
  setColor(color: string): SubjectBuilder {
    this.subject.color = color;
    return this;
  }

  /** Крок Builder: додає слот розкладу до агрегату */
  addScheduleSlot(slot: unknown): SubjectBuilder {
    this.subject.scheduleSlots.push(slot);
    return this;
  }

  /** Крок Builder: додає завдання до агрегату */
  addTask(task: unknown): SubjectBuilder {
    this.subject.tasks.push(task);
    return this;
  }

  /**
   * Фінальний метод Builder — повертає повністю зібраний об'єкт.
   * Після виклику build() подальша модифікація через Builder неможлива
   * без створення нового екземпляра.
   */
  build(): SubjectEntity {
    return this.subject;
  }
}
