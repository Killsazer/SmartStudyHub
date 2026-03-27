import { ITaskSortStrategy } from './task-sort.strategy';
import { TaskEntity, TaskPriority } from '../../entities/task.entity';

export class SortByPriorityStrategy implements ITaskSortStrategy {
  // Використовуємо Record для перекладу Enum у вагу для порівняння
  private readonly priorityWeight: Record<TaskPriority, number> = {
    [TaskPriority.HIGH]: 3,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.LOW]: 1,
  };

  sort(tasks: TaskEntity[]): TaskEntity[] {
    return [...tasks].sort((a, b) => {
      const weightA = this.priorityWeight[a.priority] || 0;
      const weightB = this.priorityWeight[b.priority] || 0;
      
      // Сортуємо в порядку спадання ваги (спочатку HIGH (3), потім MEDIUM (2), LOW (1))
      return weightB - weightA;
    });
  }
}
