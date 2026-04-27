import { Injectable, Inject } from '@nestjs/common';
import type { IScheduleSlotRepository } from '../../domain/repositories/schedule-slot.repository.interface';
import type { ISharedScheduleRepository, ScheduleSnapshotData } from '../../domain/repositories/shared-schedule.repository.interface';
import { TeacherService } from '../../../teachers/application/teacher.service';
import { SubjectService } from '../../../subjects/application/subject.service';
import { randomBytes, randomUUID } from 'crypto';

@Injectable()
export class ExportScheduleUseCase {
  constructor(
    @Inject('IScheduleSlotRepository') private readonly slotRepo: IScheduleSlotRepository,
    @Inject('ISharedScheduleRepository') private readonly sharedRepo: ISharedScheduleRepository,
    private readonly teacherService: TeacherService,
    private readonly subjectService: SubjectService,
  ) {}

  async execute(userId: string): Promise<string> {
    const [slots, teachers, subjects] = await Promise.all([
      this.slotRepo.findByUserId(userId),
      this.teacherService.getTeachers(userId),
      this.subjectService.getSubjectsByUser(userId),
    ]);

    const snapshotData: ScheduleSnapshotData = {
      subjects: subjects.map(s => ({ id: s.id, title: s.title, color: s.color })),
      teachers: teachers.map(t => ({ id: t.id, name: t.name, photoUrl: t.photoUrl, contacts: t.contacts })),
      slots: slots.map(sl => ({
        subjectId: sl.subjectId, teacherId: sl.teacherId, weekNumber: sl.weekNumber,
        dayOfWeek: sl.dayOfWeek, startTime: sl.startTime, endTime: sl.endTime,
        classType: sl.classType, location: sl.location,
      })),
    };

    const hashToken = randomBytes(4).toString('hex');

    await this.sharedRepo.save({
      id: randomUUID(),
      hashToken,
      snapshotData,
      userId,
    });

    return hashToken;
  }
}