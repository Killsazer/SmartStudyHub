import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IScheduleSlotRepository } from '../../domain/repositories/schedule-slot.repository.interface';
import type { ISharedScheduleRepository } from '../../domain/repositories/shared-schedule.repository.interface';
import { ClassType } from '../../domain/schedule-slot.entity';
import { ScheduleSlotFactory } from '../../domain/patterns/schedule-slot.factory';
import { randomUUID } from 'crypto';
import { TeacherService } from '../../../teachers/application/teacher.service';
import { SubjectService } from '../../../subjects/application/subject.service';

@Injectable()
export class ImportScheduleUseCase {
  constructor(
    @Inject('IScheduleSlotRepository') private readonly slotRepo: IScheduleSlotRepository,
    @Inject('ISharedScheduleRepository') private readonly sharedRepo: ISharedScheduleRepository,
    
    private readonly teacherService: TeacherService,
    private readonly subjectService: SubjectService,
  ) {}

  async execute(userId: string, hashToken: string): Promise<void> {
    const shared = await this.sharedRepo.findByHashToken(hashToken);
    if (!shared) throw new NotFoundException(`Schedule with code '${hashToken}' not found`);

    const snapshot = shared.snapshotData;
    const subjectIdMap = new Map<string, string>();
    const teacherIdMap = new Map<string, string>();

    for (const subj of snapshot.subjects) {
      const createdSubject = await this.subjectService.createSubject(userId, {
        title: subj.title,
        color: subj.color || '#000000',
      });
      subjectIdMap.set(subj.id, createdSubject.id);
    }

    for (const teacher of snapshot.teachers) {
      const createdTeacher = await this.teacherService.createTeacher(userId, {
        name: teacher.name,
        photoUrl: teacher.photoUrl,
        contacts: teacher.contacts,
      });
      teacherIdMap.set(teacher.id, createdTeacher.id);
    }

    for (const slot of snapshot.slots) {
      const newSubjectId = subjectIdMap.get(slot.subjectId);
      const newTeacherId = slot.teacherId ? teacherIdMap.get(slot.teacherId) ?? null : null;

      if (!newSubjectId) continue;

      const entity = ScheduleSlotFactory.createSlot(slot.classType as ClassType, {
        id: randomUUID(),
        userId,
        subjectId: newSubjectId,
        teacherId: newTeacherId,
        weekNumber: slot.weekNumber,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        location: slot.location,
      });
      
      await this.slotRepo.save(entity);
    }
  }
}
