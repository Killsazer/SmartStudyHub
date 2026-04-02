import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { ITeacherRepository } from '../../domain/repositories/teacher.repository.interface';
import { TeacherEntity, TeacherProps } from '../../domain/entities/teacher.entity';
import { CreateTeacherDto } from '../../presentation/http/dto/teacher/create-teacher.dto';
import { UpdateTeacherDto } from '../../presentation/http/dto/teacher/update-teacher.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TeacherService {
  constructor(
    @Inject('ITeacherRepository')
    private readonly teacherRepo: ITeacherRepository,
  ) {}

  async createTeacher(userId: string, dto: CreateTeacherDto): Promise<TeacherEntity> {
    const teacherId = randomUUID();
    
    const props: TeacherProps = {
      id: teacherId,
      name: dto.name,
      userId: userId,
      photoUrl: dto.photoUrl,
      contacts: dto.contacts,
    };

    const teacher = new TeacherEntity(props);
    
    await this.teacherRepo.save(teacher);
    console.log(`[TeacherService] Created teacher '${teacher.name}' for user: ${userId}`);
    
    return teacher;
  }

  // 💡 2. Додали userId та повертаємо Promise<TeacherEntity>
  async updateTeacher(userId: string, teacherId: string, dto: UpdateTeacherDto): Promise<TeacherEntity> {
    await this.checkAccess(teacherId, userId);
    
    // Припускаємо, що репозиторій (як і для слотів) ми навчимо повертати оновлену сутність
    return await this.teacherRepo.update(teacherId, dto);
  }

  // 💡 3. Додали userId для перевірки прав
  async deleteTeacher(userId: string, teacherId: string): Promise<void> {
    await this.checkAccess(teacherId, userId);
    await this.teacherRepo.delete(teacherId);
  }

  async getTeachers(userId: string): Promise<TeacherEntity[]> {
    return this.teacherRepo.findByUserId(userId);
  }

  private async checkAccess(teacherId: string, userId: string): Promise<void> {
    const teacher = await this.teacherRepo.findById(teacherId);
    if (!teacher) {
      throw new NotFoundException(`Teacher ${teacherId} not found`);
    }

    if (teacher.userId !== userId) {
      throw new ForbiddenException('Access denied: You can only modify your own teachers');
    }
  }
}