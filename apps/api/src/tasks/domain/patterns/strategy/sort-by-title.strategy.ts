/**
 * ====================================================================
 * Патерн: Strategy — Конкретна стратегія (сортування за назвою)
 * ====================================================================
 * Сортує завдання в алфавітному порядку за назвою (title).
 * Використовує `localeCompare()` для коректної роботи з Unicode.
 * ====================================================================
 */
import { ITaskSortStrategy } from './task-sort.strategy';
import { TaskEntity } from '../../task.entity';

/** Конкретна стратегія: алфавітне сортування за назвою (ascending) */
export class SortByTitleStrategy implements ITaskSortStrategy {
  sort(tasks: TaskEntity[]): TaskEntity[] {
    return [...tasks].sort((a, b) => a.title.localeCompare(b.title));
  }
}
