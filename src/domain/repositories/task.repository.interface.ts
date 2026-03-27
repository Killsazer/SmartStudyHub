// File: src/domain/repositories/task.repository.interface.ts
import { TaskEntity } from '../entities/task.entity';

export interface ITaskRepository {
  /**
   * Зберігає або оновлює завдання в БД.
   */
  save(task: TaskEntity): Promise<void>;

  /**
   * Знаходить завдання за ідентифікатором.
   */
  findById(id: string): Promise<TaskEntity | null>;

  /**
   * Знаходить всі завдання конкретного користувача.
   */
  findByUserId(userId: string): Promise<TaskEntity[]>;
}
