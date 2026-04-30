import { apiClient } from '../../../shared/api/client';
import type { ClassTypeValue } from '@studyhub/shared-types';

export interface Teacher {
  id: string;
  name: string;
  photoUrl?: string | null;
  contacts?: string | null;
}

export type ClassType = ClassTypeValue;

export interface ScheduleSlot {
  id: string;
  userId: string;
  subjectId: string;
  teacherId: string | null;
  weekNumber: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classType: ClassType;
  location: string | null;
}

// ─── Teachers API
export const getTeachers = async (): Promise<Teacher[]> => {
  const res = await apiClient.get('/teachers');
  return res.data.data;
};

export const createTeacher = async (data: Omit<Teacher, 'id'>): Promise<{ id: string }> => {
  const res = await apiClient.post('/teachers', data);
  return res.data.data;
};

export const updateTeacher = async (id: string, data: Partial<Teacher>): Promise<void> => {
  await apiClient.patch(`/teachers/${id}`, data);
};

export const deleteTeacher = async (id: string): Promise<void> => {
  await apiClient.delete(`/teachers/${id}`);
};

// ─── Schedule Slots API
export const getScheduleSlots = async (week?: number): Promise<ScheduleSlot[]> => {
  const params = week ? { week } : undefined;
  const res = await apiClient.get('/schedule-slots', { params });
  return res.data.data;
};

export const createScheduleSlot = async (data: Omit<ScheduleSlot, 'id' | 'userId'>): Promise<{ id: string }> => {
  const res = await apiClient.post('/schedule-slots', data);
  return res.data.data;
};

export const updateScheduleSlot = async (id: string, data: Partial<ScheduleSlot>): Promise<void> => {
  await apiClient.patch(`/schedule-slots/${id}`, data);
};

export const deleteScheduleSlot = async (id: string): Promise<void> => {
  await apiClient.delete(`/schedule-slots/${id}`);
};

// ─── Export / Import API
export const exportSchedule = async (): Promise<string> => {
  const res = await apiClient.post('/schedule/export');
  return res.data.data.hashToken;
};

export const importSchedule = async (hashToken: string): Promise<void> => {
  await apiClient.post('/schedule/import', { hashToken });
};
