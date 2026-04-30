import { apiClient } from '../../../shared/api/client';
import type { TaskStatusValue, TaskPriorityValue, TaskSortKeyValue } from '@studyhub/shared-types';

export type TaskStatus = TaskStatusValue;
export type TaskPriority = TaskPriorityValue;
export type SortStrategy = TaskSortKeyValue;

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string;
  description?: string;
  subjectId: string;
  isOverdue?: boolean;
  recurrenceDays?: number;
}

export const getTasks = async (subjectId?: string, sort: SortStrategy = 'deadline'): Promise<Task[]> => {
  const params: Record<string, any> = { sort };
  if (subjectId) params.subjectId = subjectId;
  const res = await apiClient.get('/tasks', { params });
  return res.data.data;
};

export const createTask = async (data: { title: string; subjectId: string; priority: TaskPriority; description?: string; deadline?: string | null; recurrenceDays?: number }): Promise<Task> => {
  const res = await apiClient.post('/tasks', data);
  return res.data.data;
};

export const changeTaskStatus = async (id: string, status: TaskStatus): Promise<void> => {
  await apiClient.patch(`/tasks/${id}/status`, { status });
};

export const updateTask = async (id: string, data: Partial<{ title: string; description: string; priority: TaskPriority; deadline: string | null; recurrenceDays: number }>): Promise<void> => {
  await apiClient.patch(`/tasks/${id}`, data);
};

export const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
};

export const undoLastAction = async (): Promise<void> => {
  await apiClient.post('/tasks/undo');
};
