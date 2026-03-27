import { ITaskSortStrategy } from './task-sort.strategy';
import { TaskEntity } from '../../entities/task.entity';

export class SortByDeadlineStrategy implements ITaskSortStrategy {
  sort(tasks: TaskEntity[]): TaskEntity[] {
    // Створюємо копію масиву щоб не мутувати оригінальний state
    return [...tasks].sort((a, b) => {
      // Якщо обидві таски не мають дедлайну, вони рівні
      if (!a.deadline && !b.deadline) return 0;
      
      // Таски без дедлайну зміщуються в кінець списку 
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;

      // Сортуємо від найближчої дати до найдальшої
      return a.deadline.getTime() - b.deadline.getTime();
    });
  }
}
