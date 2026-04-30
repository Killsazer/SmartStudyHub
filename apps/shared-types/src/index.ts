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

export enum TaskSortKey {
  DEADLINE = 'deadline',
  PRIORITY = 'priority',
  TITLE = 'title',
}

export enum ClassType {
  LECTURE = 'LECTURE',
  LAB = 'LAB',
  PRACTICE = 'PRACTICE',
}

export type TaskStatusValue = `${TaskStatus}`;
export type TaskPriorityValue = `${TaskPriority}`;
export type TaskSortKeyValue = `${TaskSortKey}`;
export type ClassTypeValue = `${ClassType}`;
