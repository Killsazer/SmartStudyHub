import { SubjectEntity } from './subject.entity';

export interface ISubjectRepository {
  save(subject: SubjectEntity): Promise<SubjectEntity>;
  update(id: string, data: Partial<{ title: string; color: string | null }>): Promise<SubjectEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<SubjectEntity | null>;
  findByUserId(userId: string): Promise<SubjectEntity[]>;
}
