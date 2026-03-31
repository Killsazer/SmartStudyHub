/**
 * ====================================================================
 * Патерн: Command (Поведінковий / Behavioral) — Конкретна команда
 * ====================================================================
 * Інкапсулює дію зміни статусу завдання як самостійний об'єкт.
 * Зберігає попередній стан для можливості відкату (undo).
 * Використовується в TaskService для надійної зміни статусу
 * з можливістю логування та збереження історії операцій.
 *
 * Ключові ознаки:
 * - Зберігає отримувача (task) та параметри дії (newStatus)
 * - `execute()` — виконує дію та зберігає стан для undo
 * - `undo()` — відкочує стан отримувача до попереднього
 * ====================================================================
 */
import { ICommand } from './command.interface';
import { TaskEntity, TaskStatus } from '../../task.entity';

export class ChangeTaskStatusCommand implements ICommand {
  /** Збережений попередній статус для можливості відкату */
  private previousStatus: TaskStatus | null = null;

  constructor(
    /** Отримувач команди — об'єкт, над яким виконується дія */
    private readonly task: TaskEntity,
    /** Новий статус, який буде встановлено */
    private readonly newStatus: TaskStatus
  ) {}

  /** Виконує команду: зберігає попередній стан та змінює статус */
  execute(): void {
    this.previousStatus = this.task.status;
    this.task.status = this.newStatus;
    console.log(`[ChangeTaskStatusCommand] Task '${this.task.title}' status changed to ${this.newStatus}`);
  }

  /** Скасовує команду: відновлює попередній статус завдання */
  undo(): void {
    if (this.previousStatus === null) {
      console.warn(`[ChangeTaskStatusCommand] Cannot undo: Command was never executed.`);
      return;
    }
    this.task.status = this.previousStatus;
    console.log(`[ChangeTaskStatusCommand] Undone: Task '${this.task.title}' reverted back to ${this.previousStatus}`);
  }
}
