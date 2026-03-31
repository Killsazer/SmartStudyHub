// File: src/schedule/domain/teacher.repository.interface.ts
import { TeacherEntity } from '../entities/teacher.entity';

export interface ITeacherRepository {
  save(teacher: TeacherEntity): Promise<void>;
  update(id: string, data: Partial<{ name: string; photoUrl: string | null; contacts: string | null }>): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<TeacherEntity | null>;
  findByUserId(userId: string): Promise<TeacherEntity[]>;
}
