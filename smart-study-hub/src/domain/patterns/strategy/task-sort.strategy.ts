import { TaskEntity } from '../../entities/task.entity';

export interface ITaskSortStrategy {
  sort(tasks: TaskEntity[]): TaskEntity[];
}
