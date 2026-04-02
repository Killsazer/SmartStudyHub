import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IScheduleSlotRepository } from '../../domain/repositories/schedule-slot.repository.interface';
import type { ITeacherRepository } from '../../domain/repositories/teacher.repository.interface';
import type { ISubjectRepository } from '../../../subjects/domain/subject.repository.interface';
import type { ISharedScheduleRepository } from '../../domain/repositories/shared-schedule.repository.interface';
import { ClassType } from '../../domain/entities/schedule-slot.entity';
import { ScheduleSlotFactory } from '../../domain/patterns/schedule-slot.factory';
import { TeacherEntity, TeacherProps } from '../../domain/entities/teacher.entity';
import { SubjectEntity } from '../../../subjects/domain/subject.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class ImportScheduleUseCase {
  constructor(
    @Inject('IScheduleSlotRepository') private readonly slotRepo: IScheduleSlotRepository,
    @Inject('ITeacherRepository') private readonly teacherRepo: ITeacherRepository,
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('ISharedScheduleRepository') private readonly sharedRepo: ISharedScheduleRepository,
  ) {}

  async execute(userId: string, hashToken: string): Promise<void> {
    const shared = await this.sharedRepo.findByHashToken(hashToken);
    if (!shared) throw new NotFoundException(`Schedule with code '${hashToken}' not found`);

    const snapshot = shared.snapshotData;
    const subjectIdMap = new Map<string, string>();
    const teacherIdMap = new Map<string, string>();

    for (const subj of snapshot.subjects) {
      const newId = randomUUID();
      subjectIdMap.set(subj.id, newId);
      
      const entity = new SubjectEntity(newId, subj.title, userId);
      entity.color = subj.color || '#000000';
      await this.subjectRepo.save(entity);
    }

    for (const teacher of snapshot.teachers) {
      const newId = randomUUID();
      teacherIdMap.set(teacher.id, newId);
      
      const props: TeacherProps = {
        id: newId, name: teacher.name, userId: userId,
        photoUrl: teacher.photoUrl, contacts: teacher.contacts,
      };
      await this.teacherRepo.save(new TeacherEntity(props));
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