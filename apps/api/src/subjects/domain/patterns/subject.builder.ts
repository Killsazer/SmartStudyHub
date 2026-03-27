// File: src/subjects/domain/patterns/subject.builder.ts
import { SubjectEntity } from '../subject.entity';
import { BaseLesson } from './lesson.factory';
import { TaskEntity } from '../../../tasks/domain/task.entity';

export class SubjectBuilder {
  private subject: SubjectEntity;

  constructor(id: string, title: string, userId: string) {
    this.subject = new SubjectEntity(id, title, userId);
    this.subject.lessons = this.subject.lessons || [];
    this.subject.tasks = this.subject.tasks || [];
  }

  setTeacher(teacherName: string): SubjectBuilder {
    this.subject.teacherName = teacherName;
    return this;
  }

  setColor(color: string): SubjectBuilder {
    this.subject.color = color;
    return this;
  }

  addLesson(lesson: BaseLesson): SubjectBuilder {
    this.subject.lessons.push(lesson);
    return this;
  }

  addTask(task: TaskEntity): SubjectBuilder {
    this.subject.tasks.push(task);
    return this;
  }

  build(): SubjectEntity {
    return this.subject;
  }
}
