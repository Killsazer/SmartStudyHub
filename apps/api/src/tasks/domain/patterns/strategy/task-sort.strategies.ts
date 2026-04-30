import { ITask, TaskPriority, TaskStatus } from '../../task.entity';
import { TaskSortKey } from '@studyhub/shared-types';

export { TaskSortKey };

export interface ITaskSortStrategy {
  sort(tasks: ITask[]): ITask[];
}

function compareStatus(a: ITask, b: ITask): number {
  const isADone = a.status === TaskStatus.DONE;
  const isBDone = b.status === TaskStatus.DONE;
  if (isADone && !isBDone) return 1;
  if (!isADone && isBDone) return -1;
  return 0;
}

export class SortByDeadlineStrategy implements ITaskSortStrategy {
  sort(tasks: ITask[]): ITask[] {
    return [...tasks].sort((a, b) => {
      const statusDiff = compareStatus(a, b);
      if (statusDiff !== 0) return statusDiff;

      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.getTime() - b.deadline.getTime();
    });
  }
}

export class SortByPriorityStrategy implements ITaskSortStrategy {
  private readonly priorityWeight: Record<TaskPriority, number> = {
    [TaskPriority.HIGH]: 3,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.LOW]: 1,
  };

  sort(tasks: ITask[]): ITask[] {
    return [...tasks].sort((a, b) => {
      const statusDiff = compareStatus(a, b);
      if (statusDiff !== 0) return statusDiff;

      const weightA = this.priorityWeight[a.priority] || 0;
      const weightB = this.priorityWeight[b.priority] || 0;
      return weightB - weightA;
    });
  }
}

export class SortByTitleStrategy implements ITaskSortStrategy {
  sort(tasks: ITask[]): ITask[] {
    return [...tasks].sort((a, b) => {
      const statusDiff = compareStatus(a, b);
      if (statusDiff !== 0) return statusDiff;

      return a.title.localeCompare(b.title);
    });
  }
}