import { SubjectEntity } from '../../../subjects/domain/subject.entity';
import { SubjectBuilder } from '../../../subjects/domain/patterns/subject.builder';
import { ScheduleSlotFactory } from '../../../schedule/domain/patterns/schedule-slot.factory';
import { ClassType } from '../../../schedule/domain/schedule-slot.entity';
import { TaskEntity, TaskStatus, TaskPriority } from '../../../tasks/domain/task.entity';
import { TeacherEntity } from '../../../teachers/domain/teacher.entity';
import { randomUUID } from 'crypto';

export class OnboardingFacade {
  
  public createInitialStudyData(userId: string): {
    subject: SubjectEntity;
    teacher: TeacherEntity;
  } {
    const subjectId = randomUUID();
    const teacherId = randomUUID();

    const teacher = new TeacherEntity({
      id: teacherId,
      name: 'StudyHub Guide',
      userId: userId,
      contacts: 'welcome@studyhub.app',
    });

    const builder = new SubjectBuilder(subjectId, 'Intro to Smart Study', userId)
      .setColor('#4CAF50');

    const welcomeSlot = ScheduleSlotFactory.createSlot(ClassType.LECTURE, {
      id: randomUUID(),
      userId,
      subjectId,
      teacherId,
      weekNumber: 1,
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '09:30',
      location: 'Virtual Classroom',
    });

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3);

    const firstTask = new TaskEntity({
      id: randomUUID(),
      title: 'Explore the Dashboard',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      userId,
      description: 'Check your schedule and try to add a new task.',
      deadline,
      subjectId,
    });

    builder.addScheduleSlot(welcomeSlot);
    builder.addTask(firstTask);

    return {
      subject: builder.build(),
      teacher,
    };
  }
}
