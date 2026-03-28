// File: src/subjects/infrastructure/prisma-subject.repository.ts
import { Injectable } from '@nestjs/common';
import { ISubjectRepository } from '../domain/subject.repository.interface';
import { SubjectEntity } from '../domain/subject.entity';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class PrismaSubjectRepository implements ISubjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(subject: SubjectEntity): Promise<void> {
    await this.prisma.subject.create({
      data: {
        id: subject.id,
        title: subject.title,
        teacherName: subject.teacherName,
        color: subject.color,
        userId: subject.userId,
        
        lessons: {
          create: subject.lessons.map((lesson) => ({
            id: lesson.props.id,
            title: lesson.props.title,
            type: lesson.type,
            startTime: lesson.props.startTime,
            endTime: lesson.props.endTime,
            location: lesson.props.location,
          }))
        },
        
        tasks: {
          create: subject.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            deadline: task.deadline,
            userId: task.userId, 
          }))
        }
      }
    });

    console.log(`[PrismaSubjectRepository] Successfully saved Subject '${subject.title}' with ${subject.lessons.length} lessons and ${subject.tasks.length} tasks to PostgreSQL.`);
  }

  async findByUserId(userId: string): Promise<any[]> {
    return this.prisma.subject.findMany({
      where: { userId },
      include: {
        lessons: true,
        tasks: true,
      },
    });
  }

  async update(id: string, data: Partial<{ title: string; teacherName: string | null; color: string | null; }>): Promise<void> {
    await this.prisma.subject.update({
      where: { id },
      data: {
        title: data.title,
        teacherName: data.teacherName,
        color: data.color,
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.subject.delete({
      where: { id }
    });
  }
}
