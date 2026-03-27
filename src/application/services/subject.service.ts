import { Injectable, Inject } from '@nestjs/common';
import type { ISubjectRepository } from '../../domain/repositories/subject.repository.interface';
import { SubjectBuilder } from '../../domain/patterns/builder/subject.builder';
import { CreateSubjectDto } from '../../presentation/dtos/create-subject.dto';

@Injectable()
export class SubjectService {
  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepo: ISubjectRepository
  ) {}

  public async createSubject(userId: string, dto: CreateSubjectDto): Promise<void> {
    const subjectId = `subj-${Date.now()}`;
    
    // Використовуємо наш класичний патерн Builder (GoF) замість ручного створення об'єкта
    const builder = new SubjectBuilder(subjectId, dto.title, userId);
    
    if (dto.teacherName) {
      builder.setTeacher(dto.teacherName);
    }
    
    if (dto.color) {
      builder.setColor(dto.color);
    }
    
    // Повертаємо готову сутність з Доменного шару
    const subject = builder.build();
    
    // Передаємо в порт (Інфраструктуру)
    await this.subjectRepo.save(subject);
    
    console.log(`[SubjectService] Dynamically created subject '${dto.title}' for user: ${userId}`);
  }
}
