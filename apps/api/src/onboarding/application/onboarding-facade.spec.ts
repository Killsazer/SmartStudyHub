import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingFacade } from './onboarding.facade';
import { SubjectService } from '../../subjects/application/subject.service';
import { TeacherService } from '../../teachers/application/teacher.service';
import { TaskService } from '../../tasks/application/task.service';
import { ScheduleSlotService } from '../../schedule/application/schedule-slot.service';
import { ClassType } from '../../schedule/domain/schedule-slot.entity';
import { TaskPriority } from '../../tasks/domain/task.entity';
import { SubjectEntity } from '../../subjects/domain/subject.entity';
import { TeacherEntity } from '../../teachers/domain/teacher.entity';

describe('OnboardingFacade', () => {
  let facade: OnboardingFacade;
  let subjectService: jest.Mocked<SubjectService>;
  let teacherService: jest.Mocked<TeacherService>;
  let taskService: jest.Mocked<TaskService>;
  let scheduleSlotService: jest.Mocked<ScheduleSlotService>;

  beforeEach(async () => {
    // Create mocks for the services
    const mockSubjectService = {
      createSubject: jest.fn(),
    };
    const mockTeacherService = {
      createTeacher: jest.fn(),
    };
    const mockTaskService = {
      createTask: jest.fn(),
    };
    const mockScheduleSlotService = {
      createSlot: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingFacade,
        { provide: SubjectService, useValue: mockSubjectService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: TaskService, useValue: mockTaskService },
        { provide: ScheduleSlotService, useValue: mockScheduleSlotService },
      ],
    }).compile();

    facade = module.get<OnboardingFacade>(OnboardingFacade);
    subjectService = module.get(SubjectService);
    teacherService = module.get(TeacherService);
    taskService = module.get(TaskService);
    scheduleSlotService = module.get(ScheduleSlotService);
  });

  describe('createInitialStudyData', () => {
    const userId = 'user-123';
    let mockSubject: SubjectEntity;
    let mockTeacher: TeacherEntity;

    beforeEach(() => {
      mockSubject = new SubjectEntity({ id: 'sub-1', title: 'Intro to Smart Study', userId, color: '#4CAF50' });
      mockTeacher = new TeacherEntity({ id: 'tch-1', name: 'StudyHub Guide', userId, contacts: 'welcome@studyhub.app' });

      teacherService.createTeacher.mockResolvedValue(mockTeacher);
      subjectService.createSubject.mockResolvedValue(mockSubject);
      taskService.createTask.mockResolvedValue({} as any);
      scheduleSlotService.createSlot.mockResolvedValue({} as any);
    });

    it('✅ should return subject and teacher for given userId', async () => {
      const result = await facade.createInitialStudyData(userId);

      expect(result).toHaveProperty('subject', mockSubject);
      expect(result).toHaveProperty('teacher', mockTeacher);
    });

    it('✅ should call teacherService to create the guide teacher', async () => {
      await facade.createInitialStudyData(userId);

      expect(teacherService.createTeacher).toHaveBeenCalledWith(userId, {
        name: 'StudyHub Guide',
        contacts: 'welcome@studyhub.app',
      });
    });

    it('✅ should call subjectService to create the introductory subject', async () => {
      await facade.createInitialStudyData(userId);

      expect(subjectService.createSubject).toHaveBeenCalledWith(userId, {
        title: 'Intro to Smart Study',
        color: '#4CAF50',
      });
    });

    it('✅ should call taskService to create an initial task linked to the subject', async () => {
      await facade.createInitialStudyData(userId);

      expect(taskService.createTask).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          title: 'Explore the Dashboard',
          priority: TaskPriority.HIGH,
          subjectId: mockSubject.id,
        }),
      );
    });

    it('✅ should call scheduleSlotService to create an initial slot linked to subject and teacher', async () => {
      await facade.createInitialStudyData(userId);

      expect(scheduleSlotService.createSlot).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          subjectId: mockSubject.id,
          teacherId: mockTeacher.id,
          classType: ClassType.LECTURE,
        }),
      );
    });
  });
});
