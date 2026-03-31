// File: src/schedule/application/import-schedule.use-case.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IScheduleSlotRepository } from '../domain/schedule-slot.repository.interface';
import type { ITeacherRepository } from '../domain/teacher.repository.interface';
import type { ISubjectRepository } from '../../subjects/domain/subject.repository.interface';
import type { ISharedScheduleRepository } from '../domain/shared-schedule.repository.interface';
import { ScheduleSlotEntity, ClassType } from '../domain/schedule-slot.entity';
import { TeacherEntity } from '../domain/teacher.entity';
import { SubjectEntity } from '../../subjects/domain/subject.entity';

@Injectable()
export class ImportScheduleUseCase {
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

  async execute(userId: string, hashToken: string): Promise<void> {
    const shared = await this.sharedRepo.findByHashToken(hashToken);
    if (!shared) {
      throw new NotFoundException(`Schedule with code '${hashToken}' not found`);
    }

    const snapshot = shared.snapshotData as {
      subjects: Array<{ id: string; title: string; color: string }>;
      teachers: Array<{ id: string; name: string; photoUrl?: string; contacts?: string }>;
      slots: Array<{
        subjectId: string;
        teacherId: string | null;
        weekNumber: number;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        classType: string;
        location?: string;
      }>;
    };

    // Map old IDs to new IDs for cloned data
    const subjectIdMap = new Map<string, string>();
    const teacherIdMap = new Map<string, string>();

    // Clone subjects
    for (const subj of snapshot.subjects) {
      const newId = `subj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      subjectIdMap.set(subj.id, newId);
      const entity = new SubjectEntity(newId, subj.title, userId);
      entity.color = subj.color || '#000000';
      await this.subjectRepo.save(entity);
    }

    // Clone teachers
    for (const teacher of snapshot.teachers) {
      const newId = `teacher-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      teacherIdMap.set(teacher.id, newId);
      const entity = new TeacherEntity(newId, teacher.name, userId, teacher.photoUrl, teacher.contacts);
      await this.teacherRepo.save(entity);
    }

    // Clone schedule slots with remapped IDs
    for (const slot of snapshot.slots) {
      const newSubjectId = subjectIdMap.get(slot.subjectId);
      const newTeacherId = slot.teacherId ? teacherIdMap.get(slot.teacherId) ?? null : null;

      if (!newSubjectId) continue; // Skip if subject mapping failed

      const newSlotId = `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const entity = new ScheduleSlotEntity(
        newSlotId, userId, newSubjectId, newTeacherId,
        slot.weekNumber, slot.dayOfWeek, slot.startTime, slot.endTime,
        slot.classType as ClassType, slot.location,
      );
      await this.slotRepo.save(entity);
    }

    console.log(`[ImportScheduleUseCase] Successfully imported schedule for user ${userId} from hash: ${hashToken}`);
  }
}
