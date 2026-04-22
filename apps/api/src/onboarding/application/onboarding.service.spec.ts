import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingFacade } from '../domain/patterns/onboarding.facade';
import { SubjectEntity } from '../../subjects/domain/subject.entity';
import { TeacherEntity } from '../../schedule/domain/entities/teacher.entity';
import { TaskEntity, TaskStatus, TaskPriority } from '../../tasks/domain/task.entity';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let mockSubjectRepo: { save: jest.Mock };
  let mockTeacherRepo: { save: jest.Mock };
  let mockFacade: { createInitialStudyData: jest.Mock };

  const createMockOnboardingData = (userId: string) => {
    const subject = new SubjectEntity('subj-1', 'Intro to Smart Study', userId);
    subject.color = '#4CAF50';
    subject.tasks = [new TaskEntity({
      id: 'task-1',
      title: 'Explore the Dashboard',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      userId,
      subjectId: 'subj-1',
    })];

    const teacher = new TeacherEntity({
      id: 'teacher-1',
      name: 'StudyHub Guide',
      userId,
      contacts: 'welcome@studyhub.app',
    });

    return { subject, teacher };
  };

  beforeEach(async () => {
    mockSubjectRepo = {
      save: jest.fn().mockResolvedValue(undefined),
    };

    mockTeacherRepo = {
      save: jest.fn().mockResolvedValue(undefined),
    };

    mockFacade = {
      createInitialStudyData: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        { provide: OnboardingFacade, useValue: mockFacade },
        { provide: 'ISubjectRepository', useValue: mockSubjectRepo },
        { provide: 'ITeacherRepository', useValue: mockTeacherRepo },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
  });

  describe('processNewUserOnboarding — success', () => {
    it('✅ should call Facade to create initial study data', async () => {
      const userId = 'user-1';
      mockFacade.createInitialStudyData.mockReturnValue(createMockOnboardingData(userId));

      await service.processNewUserOnboarding(userId);

      expect(mockFacade.createInitialStudyData).toHaveBeenCalledTimes(1);
      expect(mockFacade.createInitialStudyData).toHaveBeenCalledWith(userId);
    });

    it('✅ should save teacher BEFORE subject (FK dependency)', async () => {
      const userId = 'user-1';
      const callOrder: string[] = [];

      mockFacade.createInitialStudyData.mockReturnValue(createMockOnboardingData(userId));
      mockTeacherRepo.save.mockImplementation(async () => { callOrder.push('teacher'); });
      mockSubjectRepo.save.mockImplementation(async () => { callOrder.push('subject'); });

      await service.processNewUserOnboarding(userId);

      expect(callOrder).toEqual(['teacher', 'subject']);
    });

    it('✅ should save teacher entity from Facade result', async () => {
      const userId = 'user-1';
      const mockData = createMockOnboardingData(userId);
      mockFacade.createInitialStudyData.mockReturnValue(mockData);

      await service.processNewUserOnboarding(userId);

      expect(mockTeacherRepo.save).toHaveBeenCalledTimes(1);
      expect(mockTeacherRepo.save).toHaveBeenCalledWith(mockData.teacher);
    });

    it('✅ should save subject entity from Facade result', async () => {
      const userId = 'user-1';
      const mockData = createMockOnboardingData(userId);
      mockFacade.createInitialStudyData.mockReturnValue(mockData);

      await service.processNewUserOnboarding(userId);

      expect(mockSubjectRepo.save).toHaveBeenCalledTimes(1);
      expect(mockSubjectRepo.save).toHaveBeenCalledWith(mockData.subject);
    });
  });

  describe('processNewUserOnboarding — errors', () => {
    it('❌ should throw BadRequestException for empty userId (Fail Fast)', async () => {
      await expect(service.processNewUserOnboarding('')).rejects.toThrow(BadRequestException);

      expect(mockFacade.createInitialStudyData).not.toHaveBeenCalled();
      expect(mockTeacherRepo.save).not.toHaveBeenCalled();
      expect(mockSubjectRepo.save).not.toHaveBeenCalled();
    });

    it('❌ should propagate teacher repository errors', async () => {
      const userId = 'user-1';
      mockFacade.createInitialStudyData.mockReturnValue(createMockOnboardingData(userId));
      mockTeacherRepo.save.mockRejectedValue(new Error('DB connection lost'));

      await expect(service.processNewUserOnboarding(userId))
        .rejects.toThrow('DB connection lost');

      expect(mockSubjectRepo.save).not.toHaveBeenCalled();
    });

    it('❌ should propagate subject repository errors', async () => {
      const userId = 'user-1';
      mockFacade.createInitialStudyData.mockReturnValue(createMockOnboardingData(userId));
      mockSubjectRepo.save.mockRejectedValue(new Error('Unique constraint violation'));

      await expect(service.processNewUserOnboarding(userId))
        .rejects.toThrow('Unique constraint violation');
    });

    it('❌ should propagate Facade errors (domain validation)', async () => {
      const userId = 'user-1';
      mockFacade.createInitialStudyData.mockImplementation(() => {
        throw new Error('Invalid color format');
      });

      await expect(service.processNewUserOnboarding(userId))
        .rejects.toThrow('Invalid color format');

      expect(mockTeacherRepo.save).not.toHaveBeenCalled();
      expect(mockSubjectRepo.save).not.toHaveBeenCalled();
    });
  });
});
