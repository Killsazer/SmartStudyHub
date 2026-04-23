import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import type { ISubjectRepository } from '../domain/subject.repository.interface';
import { CreateSubjectDto } from '../presentation/dto/create-subject.dto';
import { UpdateSubjectDto } from '../presentation/dto/update-subject.dto';
import { randomUUID } from 'crypto';
import { SubjectEntity } from '../domain/subject.entity';

@Injectable()
export class SubjectService {
  private readonly logger = new Logger(SubjectService.name);

  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepo: ISubjectRepository,
  ) {}

  public async createSubject(userId: string, dto: CreateSubjectDto): Promise<SubjectEntity> {
    const subjectId = randomUUID();

    const subject = new SubjectEntity(subjectId, dto.title, userId);
    if (dto.color) {
      subject.color = dto.color;
    }
    await this.subjectRepo.save(subject);
    
    return subject;
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