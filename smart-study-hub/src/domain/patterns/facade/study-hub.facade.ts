import { SubjectEntity } from '../../entities/subject.entity';
import { SubjectBuilder } from '../builder/subject.builder';
import { LessonFactory, LessonType } from '../factory/lesson.factory';
import { TaskEntity, TaskStatus, TaskPriority } from '../../entities/task.entity';

export class StudyHubFacade {
  /**
   * Спрощений інтерфейс (Фасад) для складного процесу онбордингу.
   * Приховує від Application Layer деталі роботи Builder, Factory та ініціалізації сутностей.
   */
  public createOnboardingSubject(userId: string): SubjectEntity {
    const subjectId = `subj-onboard-${Date.now()}`;

    // 1. Використовуємо Builder для створення структури предмета
    const builder = new SubjectBuilder(subjectId, 'Welcome to Smart Study Hub', userId)
      .setTeacher('System Admin')
      .setColor('#4CAF50'); // Дружній зелений колір

    // 2. Використовуємо Factory Method для створення стартового заняття
    const welcomeLesson = LessonFactory.createLesson(LessonType.LECTURE, {
      id: `les-onboard-${Date.now()}`,
      title: 'How to use the Hub',
      subjectId: subjectId,
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000), // +1 година
      location: 'Online Interactive Guide'
    });

    builder.addLesson(welcomeLesson);

    // 3. Створюємо перше завдання (Task)
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 1); // Дедлайн: 1 день

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

    // 4. Повертаємо готовий складний об'єкт
    // Тепер клієнтському коду достатньо викликати 1 метод замість 30 рядків коду
    return builder.build();
  }
}
