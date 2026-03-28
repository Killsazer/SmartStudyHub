// File: src/tasks/domain/task.repository.interface.ts
import { TaskEntity } from './task.entity';

export interface ITaskRepository {
  save(task: TaskEntity): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<TaskEntity | null>;
  findByUserId(userId: string): Promise<TaskEntity[]>;
}
