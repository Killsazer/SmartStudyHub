import { Injectable } from '@nestjs/common';
import { ISubjectRepository } from '../../domain/repositories/subject.repository.interface';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaSubjectRepository implements ISubjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(subject: SubjectEntity): Promise<void> {
    // 1. Мапінг чистих сутностей (Domain Entities) на структури даних Prisma (Infrastructure)
    // 2. Використовуємо транзакційний підхід для створення кореневої сутності та її нащадків
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
            type: lesson.type, // БЕРЕМО ТИП БЕЗПОСЕРЕДНЬО З ОБ'ЄКТА
            startTime: lesson.props.startTime,
            endTime: lesson.props.endTime,
            location: lesson.props.location,
          }))
        },
        
        // Вкладений запис завдань
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
    // В чистому CQRS архітектурі Читання (Query) виконує найшвидший запит, витягуючи
    // сирі дані, щоб не навантажувати сервер процесом мапінгу у Domain об'єкти
    return this.prisma.subject.findMany({
      where: { userId },
      include: {
        lessons: true,
        tasks: true,
        // notes: true
      },
    });
  }
}
