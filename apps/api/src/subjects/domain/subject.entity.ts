// File: src/subjects/domain/subject.entity.ts
import { BaseLesson } from './patterns/lesson.factory';
import { TaskEntity } from '../../tasks/domain/task.entity';
import { NoteEntity } from '../../notes/domain/note.entity';

export class SubjectEntity {
  public teacherName?: string;
  public color: string = '#000000';
  public lessons: BaseLesson[] = [];
  public tasks: TaskEntity[] = [];
  public notes: NoteEntity[] = [];

  constructor(
    public readonly id: string,
    public title: string,
    public readonly userId: string,
  ) {}
}
