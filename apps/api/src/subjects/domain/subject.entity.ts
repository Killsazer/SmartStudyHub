// File: src/subjects/domain/subject.entity.ts
import { BaseScheduleSlot } from '../../schedule/domain/patterns/schedule-slot.factory';
import { TaskEntity } from '../../tasks/domain/task.entity';
import { NoteEntity } from '../../notes/domain/note.entity';

export class SubjectEntity {
  public color: string = '#000000';
  public scheduleSlots: BaseScheduleSlot[] = [];
  public tasks: TaskEntity[] = [];
  public notes: NoteEntity[] = [];

  constructor(
    public readonly id: string,
    public title: string,
    public readonly userId: string,
  ) {}
}
