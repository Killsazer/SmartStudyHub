import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import type { ITeacherRepository } from '../domain/teacher.repository.interface';
import { TeacherEntity, TeacherProps } from '../domain/teacher.entity';
import { CreateTeacherDto } from '../presentation/dto/create-teacher.dto';
import { UpdateTeacherDto } from '../presentation/dto/update-teacher.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TeacherService {
  private readonly logger = new Logger(TeacherService.name);

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
    this.logger.log(`Created teacher '${teacher.name}' for user: ${userId}`);
    
    return teacher;
  }

  async findTeacherById(teacherId: string): Promise<TeacherEntity | null> {
    return this.teacherRepo.findById(teacherId);
  }

  async updateTeacher(userId: string, teacherId: string, dto: UpdateTeacherDto): Promise<TeacherEntity> {
    await this.checkAccess(teacherId, userId);
    return await this.teacherRepo.update(teacherId, dto);
  }

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