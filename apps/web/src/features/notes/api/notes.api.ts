import { apiClient } from '../../../shared/api/client';

export interface NoteComponent {
  id: string;
  type: 'section' | 'block';
  title: string;
  content: string | null;
  parentId: string | null;
  subjectId: string | null;
  children?: NoteComponent[];
}

export const getNoteTree = async (): Promise<NoteComponent[]> => {
  const res = await apiClient.get('/notes/tree');
  return res.data.data;
};

export const createNote = async (data: { title: string; content?: string; parentId?: string; subjectId?: string }): Promise<void> => {
  await apiClient.post('/notes', data);
};

export const updateNote = async (id: string, data: { title?: string; content?: string }): Promise<void> => {
  await apiClient.patch(`/notes/${id}`, data);
};

export const deleteNote = async (id: string): Promise<void> => {
  await apiClient.delete(`/notes/${id}`);
};
