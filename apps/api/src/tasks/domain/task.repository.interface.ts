import { TaskEntity } from './task.entity';

export interface ITaskRepository {
  save(task: TaskEntity): Promise<TaskEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<TaskEntity | null>;
  findByUserId(userId: string): Promise<TaskEntity[]>;
}
