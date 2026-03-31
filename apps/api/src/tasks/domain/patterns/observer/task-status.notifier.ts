/**
 * ====================================================================
 * Патерн: Observer (Поведінковий / Behavioral) — Конкретний суб'єкт
 * ====================================================================
 * TaskStatusNotifier — реалізація IObservable для доменної сутності Task.
 * Керує списком спостерігачів та розсилає їм оновлення при зміні
 * статусу завдання. Спостерігачі (наприклад, DeadlineAlertObserver)
 * автоматично реагують, не знаючи деталей один одного — Low Coupling.
 *
 * Ключові ознаки:
 * - Підтримує динамічне підключення/відключення спостерігачів
 * - Перевіряє дублікати при attach (ідемпотентність)
 * - Ітерує по всіх спостерігачах у notify()
 * ====================================================================
 */
import { IObservable, IObserver } from './observer.interfaces';
import { TaskEntity } from '../../task.entity';

/**
 * Конкретний суб'єкт — розсилає оновлення TaskEntity всім
 * підписаним спостерігачам при зміні статусу завдання.
 */
export class TaskStatusNotifier implements IObservable<TaskEntity> {
  private observers: IObserver<TaskEntity>[] = [];

  /** Додає спостерігача (з перевіркою на дублікат) */
  attach(observer: IObserver<TaskEntity>): void {
    const isExist = this.observers.includes(observer);
    if (!isExist) {
      this.observers.push(observer);
    }
  }

  /** Відписує спостерігача від оновлень */
  detach(observer: IObserver<TaskEntity>): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  /** Розсилає оновлення всім підписаним спостерігачам */
  notify(task: TaskEntity): void {
    for (const observer of this.observers) {
      observer.update(task);
    }
  }
}
