import { ScheduleSlotEntity } from '../../schedule/domain/schedule-slot.entity';
import { TaskEntity } from '../../tasks/domain/task.entity';
import { NoteComponent } from '../../notes/domain/patterns/composite/note-component';

export class SubjectEntity {
  public color: string = '#000000';
  public scheduleSlots: ScheduleSlotEntity[] = [];
  public tasks: TaskEntity[] = [];
  public notes: NoteComponent[] = [];

  constructor(
    public readonly id: string,
    public title: string,
    public readonly userId: string,
  ) {}
}
