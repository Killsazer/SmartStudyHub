// File: src/subjects/application/subject-query.service.ts
import { Injectable, Inject } from '@nestjs/common';
import type { ISubjectRepository } from '../domain/subject.repository.interface';

@Injectable()
export class SubjectQueryService {
  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepo: ISubjectRepository
  ) {}

  public async getSubjectsByUser(userId: string): Promise<any[]> {
    console.log(`[SubjectQueryService] Fetching subjects for user: ${userId}`);
    return this.subjectRepo.findByUserId(userId);
  }
}
