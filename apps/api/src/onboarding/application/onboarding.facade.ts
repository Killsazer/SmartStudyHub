import { Injectable, Logger } from '@nestjs/common';
import { SubjectService } from '../../subjects/application/subject.service';
import { TeacherService } from '../../teachers/application/teacher.service';
import { TaskService } from '../../tasks/application/task.service';
import { ScheduleSlotService } from '../../schedule/application/schedule-slot.service';
import { ClassType } from '../../schedule/domain/schedule-slot.entity';
import { TaskPriority } from '../../tasks/domain/task.entity';
import { SubjectEntity } from '../../subjects/domain/subject.entity';
import { TeacherEntity } from '../../teachers/domain/teacher.entity';

@Injectable()
export class OnboardingFacade {
  private readonly logger = new Logger(OnboardingFacade.name);

  constructor(
    private readonly subjectService: SubjectService,
    private readonly teacherService: TeacherService,
    private readonly taskService: TaskService,
    private readonly scheduleSlotService: ScheduleSlotService,
  ) {}

  async createInitialStudyData(userId: string): Promise<{
    subject: SubjectEntity;
    teacher: TeacherEntity;
  }> {
    const teacher = await this.teacherService.createTeacher(userId, {
      name: 'StudyHub Guide',
      contacts: 'welcome@studyhub.app',
    });

    const subject = await this.subjectService.createSubject(userId, {
      title: 'Intro to Smart Study',
      color: '#4CAF50',
    });

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3);

    await this.taskService.createTask(userId, {
      title: 'Explore the Dashboard',
      priority: TaskPriority.HIGH,
      description: 'Check your schedule and try to add a new task.',
      deadline: deadline.toISOString(),
      subjectId: subject.id,
    });

    await this.scheduleSlotService.createSlot(userId, {
      subjectId: subject.id,
      teacherId: teacher.id,
      weekNumber: 1,
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '09:30',
      classType: ClassType.LECTURE,
      location: 'Virtual Classroom',
    });

    this.logger.log(`Created initial study data for user: ${userId}`);

    return { subject, teacher };
  }
}
