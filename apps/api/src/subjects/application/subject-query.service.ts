// File: src/subjects/application/subject-query.service.ts
import { Injectable, Inject } from '@nestjs/common';
import type { ISubjectRepository } from '../domain/subject.repository.interface';
import { SubjectEntity } from '../domain/subject.entity';

@Injectable()
export class SubjectQueryService {
  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepo: ISubjectRepository
  ) {}

  /**
   * Returns all subjects belonging to a given user.
   */
  public async getSubjectsByUser(userId: string): Promise<SubjectEntity[]> {
    return this.subjectRepo.findByUserId(userId);
  }
}
