// File: src/tasks/domain/patterns/observer/deadline-alert.observer.ts
import { IObserver } from './observer.interfaces';
import { TaskEntity, TaskStatus } from '../../task.entity';
import { DeadlineNotificationManager } from '../singleton/deadline-notification.manager';

export class DeadlineAlertObserver implements IObserver<TaskEntity> {
  update(task: TaskEntity): void {
    if (task.status === TaskStatus.DONE) {
      const notificationManager = DeadlineNotificationManager.getInstance();
      const message = `Task '${task.title}' is completed!`;
      notificationManager.queueHotNotification(task.userId, message);
      console.log(`[DeadlineAlertObserver] Processed DONE status for task '${task.id}', queued push-notification for user '${task.userId}'.`);
    }
  }
}
