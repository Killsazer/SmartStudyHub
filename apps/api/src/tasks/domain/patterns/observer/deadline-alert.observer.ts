/**
 * ====================================================================
 * Патерн: Observer (Поведінковий / Behavioral) — Конкретний спостерігач
 * ====================================================================
 * DeadlineAlertObserver реагує на зміни статусу завдань.
 * Коли завдання отримує статус DONE, спостерігач делегує
 * відправку push-сповіщення до Singleton-менеджера (DeadlineNotificationManager).
 *
 * Це демонструє кооперацію двох патернів: Observer → Singleton.
 * ====================================================================
 */
import { IObserver } from './observer.interfaces';
import { TaskEntity, TaskStatus } from '../../task.entity';
import { DeadlineNotificationManager } from '../singleton/deadline-notification.manager';

/**
 * Конкретний спостерігач — обробляє подію завершення завдання.
 * Використовує Singleton (DeadlineNotificationManager) для надсилання сповіщень.
 */
export class DeadlineAlertObserver implements IObserver<TaskEntity> {
  /** Обробник оновлення — викликається автоматично суб'єктом (TaskStatusNotifier) */
  update(task: TaskEntity): void {
    if (task.status === TaskStatus.DONE) {
      const notificationManager = DeadlineNotificationManager.getInstance();
      const message = `Task '${task.title}' is completed!`;
      notificationManager.queueHotNotification(task.userId, message);
      console.log(`[DeadlineAlertObserver] Processed DONE status for task '${task.id}', queued notification for user '${task.userId}'.`);
    }
  }
}
