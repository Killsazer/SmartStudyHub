import { IObserver } from './observer.interfaces';
import { TaskEntity, TaskStatus } from '../../entities/task.entity';
import { DeadlineNotificationManager } from '../singleton/deadline-notification.manager';

export class DeadlineAlertObserver implements IObserver<TaskEntity> {
  update(task: TaskEntity): void {
    // Реагуємо лише якщо завдання виконане
    if (task.status === TaskStatus.DONE) {
      const notificationManager = DeadlineNotificationManager.getInstance();
      
      const message = `Task '${task.title}' is completed!`;
      
      // Кладемо сповіщення в чергу конкретного користувача через наш Singleton
      notificationManager.queueHotNotification(task.userId, message);
      
      console.log(`[DeadlineAlertObserver] Processed DONE status for task '${task.id}', queued push-notification for user '${task.userId}'.`);
    }
  }
}
