// File: src/tasks/domain/task.entity.ts
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface ITask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority; 
  userId: string;         
  deadline?: Date;
  description?: string;   
  subjectId?: string;     
  
  completeTask(): ITask | null;
}

export class TaskEntity implements ITask {
  constructor(
    public readonly id: string,
    public title: string,
    public status: TaskStatus,
    public priority: TaskPriority,
    public readonly userId: string,
    public description?: string,
    public deadline?: Date,
    public subjectId?: string,
  ) {}

  completeTask(): ITask | null {
    if (this.status === TaskStatus.DONE) {
      throw new Error('Task is already completed');
    }
    
    this.status = TaskStatus.DONE;
    return null;
  }
}
