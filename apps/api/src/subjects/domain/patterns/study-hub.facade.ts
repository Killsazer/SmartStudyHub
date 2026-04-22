import { SubjectEntity } from '../subject.entity';
import { SubjectBuilder } from './subject.builder';
import { ScheduleSlotFactory } from 'src/schedule/domain/patterns/schedule-slot.factory';
import { ClassType } from 'src/schedule/domain/entities/schedule-slot.entity';
import { TaskEntity, TaskStatus, TaskPriority } from '../../../tasks/domain/task.entity';
import { TeacherEntity } from '../../../schedule/domain/entities/teacher.entity';
import { randomUUID } from 'crypto';

export class StudyHubFacade {
  public createOnboardingData(userId: string): {
    subject: SubjectEntity;
    teacher: TeacherEntity;
  } {
    const subjectId = `subj-onboard-${Date.now()}`;
    const teacherId = `teacher-onboard-${Date.now()}`;

    // Create a sample teacher via entity
    const teacher = new TeacherEntity({
      id: teacherId,
      name: 'System Admin',
      userId: userId,
      photoUrl: undefined,
      contacts: 'support@studyhub.app',
    });

    const builder = new SubjectBuilder(subjectId, 'Welcome to Smart Study Hub', userId)
      .setColor('#4CAF50');

    // Use Factory Method to create a sample schedule slot
    const welcomeSlot = ScheduleSlotFactory.createSlot(ClassType.LECTURE, {
      id: `slot-onboard-${Date.now()}`,
      userId,
      subjectId,
      teacherId,
      weekNumber: 1,
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '10:30',
      location: 'Online Interactive Guide',
    });

    builder.addScheduleSlot(welcomeSlot);

    // Create a profile completion task
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 1);

    const profileTask = new TaskEntity({
      id: randomUUID(),
      title: 'Complete your profile',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      userId,
      description: 'Add your avatar and fill out personal information to fully unlock the platform.',
      deadline,
      subjectId,
    });

    builder.addTask(profileTask);

    return {
      subject: builder.build(),
      teacher,
    };
  }
}
