import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { ISubjectRepository } from '../domain/subject.repository.interface';
import { SubjectBuilder } from '../domain/patterns/subject.builder';
import { CreateSubjectDto } from '../presentation/dto/create-subject.dto';
import { UpdateSubjectDto } from '../presentation/dto/update-subject.dto';
import { randomUUID } from 'crypto';
import { SubjectEntity } from '../domain/subject.entity';

@Injectable()
export class SubjectService {
  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepo: ISubjectRepository
  ) {}

  public async createSubject(userId: string, dto: CreateSubjectDto): Promise<string> {
    const subjectId = randomUUID();
    const builder = new SubjectBuilder(subjectId, dto.title, userId);

    if (dto.color) {
      builder.setColor(dto.color);
    }

    const subject = builder.build();
    await this.subjectRepo.save(subject);

    console.log(`[SubjectService] Dynamically created subject '${dto.title}' for user: ${userId}`);
    return subject.id;
  }

  public async updateSubject(userId: string, subjectId: string, dto: UpdateSubjectDto): Promise<void> {
    await this.checkAccess(subjectId, userId);
    
    await this.subjectRepo.update(subjectId, {
      title: dto.title,
      color: dto.color,
    });
  }

  public async deleteSubject(userId: string, subjectId: string): Promise<void> {
    await this.checkAccess(subjectId, userId);
    await this.subjectRepo.delete(subjectId);
  }

  public async getSubjectsByUser(userId: string): Promise<SubjectEntity[]> {
    return this.subjectRepo.findByUserId(userId);
  }

  private async checkAccess(subjectId: string, userId: string): Promise<void> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    if (subject.userId !== userId) {
      throw new ForbiddenException('Access denied: You can only modify your own subjects');
    }
  }
}
