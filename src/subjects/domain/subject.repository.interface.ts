// File: src/subjects/domain/subject.repository.interface.ts
import { SubjectEntity } from './subject.entity';

export interface ISubjectRepository {
  save(subject: SubjectEntity): Promise<void>;
  findByUserId(userId: string): Promise<any[]>;
}
