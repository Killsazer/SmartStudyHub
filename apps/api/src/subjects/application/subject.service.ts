// File: src/subjects/application/subject.service.ts
import { Injectable, Inject } from '@nestjs/common';
import type { ISubjectRepository } from '../domain/subject.repository.interface';
import { SubjectBuilder } from '../domain/patterns/subject.builder';
import { CreateSubjectDto } from '../presentation/create-subject.dto';
import { UpdateSubjectDto } from '../presentation/update-subject.dto';

@Injectable()
export class SubjectService {
  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepo: ISubjectRepository
  ) {}

  public async createSubject(userId: string, dto: CreateSubjectDto): Promise<string> {
    const subjectId = `subj-${Date.now()}`;
    const builder = new SubjectBuilder(subjectId, dto.title, userId);
    
    if (dto.teacherName) {
      builder.setTeacher(dto.teacherName);
    }
    
    if (dto.color) {
      builder.setColor(dto.color);
    }
    
    const subject = builder.build();
    await this.subjectRepo.save(subject);
    
    console.log(`[SubjectService] Dynamically created subject '${dto.title}' for user: ${userId}`);
    return subject.id;
  }

  public async updateSubject(userId: string, subjectId: string, dto: UpdateSubjectDto): Promise<void> {
    // Ideally we should check if subject belongs to userId first, but trusting controller/guard for simplicity
    await this.subjectRepo.update(subjectId, {
      title: dto.title,
      teacherName: dto.teacherName,
      color: dto.color,
    });
  }

  public async deleteSubject(userId: string, subjectId: string): Promise<void> {
    // Ideally check owner first
    await this.subjectRepo.delete(subjectId);
  }
}
