// File: src/tasks/domain/patterns/observer/task-status.notifier.ts
import { IObservable, IObserver } from './observer.interfaces';
import { TaskEntity } from '../../task.entity';

export class TaskStatusNotifier implements IObservable<TaskEntity> {
  private observers: IObserver<TaskEntity>[] = [];

  attach(observer: IObserver<TaskEntity>): void {
    const isExist = this.observers.includes(observer);
    if (!isExist) {
      this.observers.push(observer);
    }
  }

  detach(observer: IObserver<TaskEntity>): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notify(task: TaskEntity): void {
    for (const observer of this.observers) {
      observer.update(task);
    }
  }
}
