import { apiClient } from '../../../shared/api/client';

export interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline?: string;
  subjectId: string;
}

export type SortStrategy = 'deadline' | 'priority' | 'title';

export const getTasks = async (subjectId: string, sort: SortStrategy = 'deadline'): Promise<Task[]> => {
  const res = await apiClient.get('/tasks', { params: { subjectId, sort } });
  return res.data.data;
};

export const createTask = async (data: { title: string; subjectId: string; priority: string; deadline?: string }): Promise<Task> => {
  const res = await apiClient.post('/tasks', data);
  return res.data.data;
};

export const changeTaskStatus = async (id: string, status: string): Promise<void> => {
  await apiClient.patch(`/tasks/${id}/status`, { status });
};
