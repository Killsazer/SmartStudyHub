import { apiClient } from '../../../shared/api/client';

export interface SubjectItem {
  id: string;
  title: string;
  teacherName?: string;
  color: string;
}

export const getSubjects = async (): Promise<SubjectItem[]> => {
  const res = await apiClient.get('/subjects');
  return res.data.data;
};

export const createSubject = async (data: { title: string; teacherName?: string; color: string }): Promise<SubjectItem> => {
  const res = await apiClient.post('/subjects', data);
  return res.data.data;
};
