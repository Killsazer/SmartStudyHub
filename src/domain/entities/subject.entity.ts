import { BaseLesson } from '../patterns/factory/lesson.factory';
import { TaskEntity } from './task.entity';
import { NoteEntity } from './note.entity';

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
