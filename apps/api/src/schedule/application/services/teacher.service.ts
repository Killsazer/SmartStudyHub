// File: src/schedule/application/teacher.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ITeacherRepository } from '../../domain/repositories/teacher.repository.interface';
import { TeacherEntity } from '../../domain/entities/teacher.entity';
import { CreateTeacherDto } from '../../presentation/http/dtos/create-teacher.dto';
import { UpdateTeacherDto } from '../../presentation/http/dtos/update-teacher.dto';

@Injectable()
export class TeacherService {
  constructor(
    @Inject('ITeacherRepository')
    private readonly teacherRepo: ITeacherRepository,
  ) {}

  async createTeacher(userId: string, dto: CreateTeacherDto): Promise<TeacherEntity> {
    const teacher = new TeacherEntity(
      `teacher-${Date.now()}`,
      dto.name,
      userId,
      dto.photoUrl,
      dto.contacts,
    );
    await this.teacherRepo.save(teacher);
    console.log(`[TeacherService] Created teacher '${dto.name}' for user: ${userId}`);
    return teacher;
  }

  async updateTeacher(userId: string, teacherId: string, dto: UpdateTeacherDto): Promise<void> {
    const teacher = await this.teacherRepo.findById(teacherId);
    if (!teacher) throw new NotFoundException(`Teacher ${teacherId} not found`);
    await this.teacherRepo.update(teacherId, {
      name: dto.name,
      photoUrl: dto.photoUrl,
      contacts: dto.contacts,
    });
  }

  async deleteTeacher(userId: string, teacherId: string): Promise<void> {
    await this.teacherRepo.delete(teacherId);
  }

  async getTeachers(userId: string): Promise<TeacherEntity[]> {
    return this.teacherRepo.findByUserId(userId);
  }
}
