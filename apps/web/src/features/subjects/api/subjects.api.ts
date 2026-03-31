import { apiClient } from '../../../shared/api/client';

export interface SubjectItem {
  id: string;
  title: string;
  color: string;
  tasks?: Array<{ id: string; status: string }>;
}

export const getSubjects = async (): Promise<SubjectItem[]> => {
  const res = await apiClient.get('/subjects');
  return res.data.data;
};

export const createSubject = async (data: { title: string; color: string }): Promise<SubjectItem> => {
  const res = await apiClient.post('/subjects', data);
  return res.data.data;
};

export const updateSubject = async (id: string, data: Partial<{ title: string; color: string }>): Promise<void> => {
  await apiClient.patch(`/subjects/${id}`, data);
};

export const deleteSubject = async (id: string): Promise<void> => {
  await apiClient.delete(`/subjects/${id}`);
};
