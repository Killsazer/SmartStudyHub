// File: src/schedule/application/export-schedule.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import type { IScheduleSlotRepository } from '../../domain/repositories/schedule-slot.repository.interface';
import type { ITeacherRepository } from '../../domain/repositories/teacher.repository.interface';
import type { ISubjectRepository } from '../../../subjects/domain/subject.repository.interface';
import type { ISharedScheduleRepository, ScheduleSnapshotData } from '../../domain/repositories/shared-schedule.repository.interface';
import * as crypto from 'crypto';

@Injectable()
export class ExportScheduleUseCase {
  constructor(
    @Inject('IScheduleSlotRepository')
    private readonly slotRepo: IScheduleSlotRepository,
    @Inject('ITeacherRepository')
    private readonly teacherRepo: ITeacherRepository,
    @Inject('ISubjectRepository')
    private readonly subjectRepo: ISubjectRepository,
    @Inject('ISharedScheduleRepository')
    private readonly sharedRepo: ISharedScheduleRepository,
  ) {}

  async execute(userId: string): Promise<string> {
    const [slots, teachers, subjects] = await Promise.all([
      this.slotRepo.findByUserId(userId),
      this.teacherRepo.findByUserId(userId),
      this.subjectRepo.findByUserId(userId),
    ]);

    const snapshotData: ScheduleSnapshotData = {
      subjects: subjects.map(s => ({
        id: s.id,
        title: s.title,
        color: s.color,
      })),
      teachers: teachers.map(t => ({
        id: t.id,
        name: t.name,
        photoUrl: t.photoUrl,
        contacts: t.contacts,
      })),
      slots: slots.map(sl => ({
        subjectId: sl.subjectId,
        teacherId: sl.teacherId,
        weekNumber: sl.weekNumber,
        dayOfWeek: sl.dayOfWeek,
        startTime: sl.startTime,
        endTime: sl.endTime,
        classType: sl.classType,
        location: sl.location,
      })),
    };

    // Generate 8-character hash token
    const hashToken = crypto.randomBytes(4).toString('hex');

    await this.sharedRepo.save({
      id: `shared-${Date.now()}`,
      hashToken,
      snapshotData,
      userId,
    });

    return hashToken;
  }
}
