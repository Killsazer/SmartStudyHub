
import { SubjectEntity } from './subject.entity';

export interface ISubjectRepository {
  save(subject: SubjectEntity): Promise<void>;
  update(id: string, data: Partial<{ title: string; color: string | null }>): Promise<void>;
  delete(id: string): Promise<void>;
  findByUserId(userId: string): Promise<SubjectEntity[]>;
}
