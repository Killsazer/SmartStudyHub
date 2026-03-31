/**
 * ====================================================================
 * Патерн: Strategy (Поведінковий / Behavioral) — Контекст
 * ====================================================================
 * TaskSortContext зберігає посилання на обрану стратегію сортування
 * і делегує їй виконання. Клієнтський код (TaskService) може
 * динамічно підмінити стратегію через `setStrategy()` або конструктор.
 *
 * Контекст не знає деталей конкретних алгоритмів — працює
 * виключно через інтерфейс ITaskSortStrategy (Low Coupling).
 * ====================================================================
 */
import { ITaskSortStrategy } from './task-sort.strategy';
import { TaskEntity } from '../../task.entity';

/**
 * Контекст Strategy — делегує сортування обраній стратегії.
 * Підтримує зміну стратегії під час виконання (runtime).
 */
export class TaskSortContext {
  constructor(private strategy: ITaskSortStrategy) {}

  /** Змінює стратегію під час виконання */
  setStrategy(strategy: ITaskSortStrategy) {
    this.strategy = strategy;
  }

  /** Делегує сортування обраній стратегії */
  executeStrategy(tasks: TaskEntity[]): TaskEntity[] {
    return this.strategy.sort(tasks);
  }
}
