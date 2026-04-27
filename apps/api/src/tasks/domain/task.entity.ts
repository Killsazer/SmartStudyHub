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

export interface TaskProps {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  userId: string;
  deadline?: Date;
  description?: string;
  subjectId?: string;
  recurrenceDays?: number;
}

export interface ITask {
  readonly id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  readonly userId: string;
  deadline?: Date;
  description?: string;
  subjectId?: string;
  recurrenceDays?: number;
  
  completeTask(): ITask | null; 
}

export class TaskEntity implements ITask {
  public readonly id: string;
  public title: string;
  public status: TaskStatus;
  public priority: TaskPriority;
  public readonly userId: string;
  public deadline?: Date;
  public description?: string;
  public subjectId?: string;
  public recurrenceDays?: number;

  constructor(props: TaskProps) {
    this.id = props.id;
    this.title = props.title;
    this.status = props.status;
    this.priority = props.priority;
    this.userId = props.userId;
    this.deadline = props.deadline;
    this.description = props.description;
    this.subjectId = props.subjectId;
    this.recurrenceDays = props.recurrenceDays;
  }

    completeTask(): ITask | null {
      if (this.status === TaskStatus.DONE) return null;
      
      this.status = TaskStatus.DONE;
      return null; 
    }
}
