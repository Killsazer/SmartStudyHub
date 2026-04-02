import { TeacherEntity } from '../entities/teacher.entity';

export type UpdateTeacherData = Partial<{
  name: string;
  photoUrl: string | null;
  contacts: string | null;
}>;

export interface ITeacherRepository {
  save(teacher: TeacherEntity): Promise<TeacherEntity>;
  update(id: string, data: UpdateTeacherData): Promise<TeacherEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<TeacherEntity | null>;
  findByUserId(userId: string): Promise<TeacherEntity[]>;
}