// File: src/subjects/domain/patterns/study-hub.facade.ts
import { SubjectEntity } from '../subject.entity';
import { SubjectBuilder } from './subject.builder';
import { LessonFactory, LessonType } from './lesson.factory';
import { TaskEntity, TaskStatus, TaskPriority } from '../../../tasks/domain/task.entity';

export class StudyHubFacade {
  public createOnboardingSubject(userId: string): SubjectEntity {
    const subjectId = `subj-onboard-${Date.now()}`;

    const builder = new SubjectBuilder(subjectId, 'Welcome to Smart Study Hub', userId)
      .setTeacher('System Admin')
      .setColor('#4CAF50');

    const welcomeLesson = LessonFactory.createLesson(LessonType.LECTURE, {
      id: `les-onboard-${Date.now()}`,
      title: 'How to use the Hub',
      subjectId: subjectId,
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
      location: 'Online Interactive Guide'
    });

    builder.addLesson(welcomeLesson);

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 1);

    const profileTask = new TaskEntity(
      `task-onboard-${Date.now()}`,
      'Complete your profile',
      TaskStatus.TODO,
      TaskPriority.HIGH,
      userId,
      'Add your avatar and fill out personal information to fully unlock the platform.',
      deadline,
      subjectId
    );

    builder.addTask(profileTask);

    return builder.build();
  }
}
