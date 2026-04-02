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

// 💡 1. Вводимо Props для безпечного створення об'єктів
export interface TaskProps {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  userId: string;
  deadline?: Date;
  description?: string;
  subjectId?: string;
}

export class TaskEntity {
  public readonly id: string;
  public title: string;
  public status: TaskStatus;
  public priority: TaskPriority;
  public readonly userId: string;
  public deadline?: Date;
  public description?: string;
  public subjectId?: string;

  constructor(props: TaskProps) {
    this.id = props.id;
    this.title = props.title;
    this.status = props.status;
    this.priority = props.priority;
    this.userId = props.userId;
    this.deadline = props.deadline;
    this.description = props.description;
    this.subjectId = props.subjectId;
  }

  // 💡 2. Метод тепер або мутує об'єкт (повертає void), або кидає помилку
  completeTask(): void {
    if (this.status === TaskStatus.DONE) {
      throw new Error('Task is already completed');
    }
    this.status = TaskStatus.DONE;
  }
}