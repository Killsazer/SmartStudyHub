import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import type { ISubjectRepository } from '../domain/subject.repository.interface';
import { SubjectEntity } from '../domain/subject.entity';
import { CreateSubjectDto } from '../presentation/dto/create-subject.dto';
import { UpdateSubjectDto } from '../presentation/dto/update-subject.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class SubjectService {
  private readonly logger = new Logger(SubjectService.name);

  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepo: ISubjectRepository,
  ) {}

  public async createSubject(userId: string, dto: CreateSubjectDto): Promise<SubjectEntity> {
    const subject = new SubjectEntity({
      id: randomUUID(),
      title: dto.title,
      userId: userId,
      color: dto.color ?? '#000000',
    });

    await this.subjectRepo.save(subject);
    
    this.logger.log(`Created subject via Builder: ${subject.title}`);
    return subject;
  }

  public async updateSubject(userId: string, subjectId: string, dto: UpdateSubjectDto): Promise<SubjectEntity> {
    await this.checkAccess(subjectId, userId);

    return await this.subjectRepo.update(subjectId, {
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

  public async deleteAllSubjects(userId: string): Promise<void> {
    await this.subjectRepo.deleteAll(userId);
  }

  private async checkAccess(subjectId: string, userId: string): Promise<SubjectEntity> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    if (subject.userId !== userId) {
      throw new ForbiddenException('Access denied: You can only modify your own subjects');
    }

    return subject;
  }
}