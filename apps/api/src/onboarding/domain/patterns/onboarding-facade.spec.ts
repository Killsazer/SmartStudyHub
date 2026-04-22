import { OnboardingFacade } from './onboarding.facade';
import { SubjectEntity } from '../../../subjects/domain/subject.entity';
import { TeacherEntity } from '../../../schedule/domain/entities/teacher.entity';
import { TaskStatus, TaskPriority } from '../../../tasks/domain/task.entity';
import { ClassType } from '../../../schedule/domain/entities/schedule-slot.entity';

describe('OnboardingFacade', () => {
  let facade: OnboardingFacade;

  beforeEach(() => {
    facade = new OnboardingFacade();
  });

  describe('createInitialStudyData', () => {
    const userId = 'user-123';

    it('✅ should return subject and teacher for given userId', () => {
      const result = facade.createInitialStudyData(userId);

      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('teacher');
    });

    it('✅ should create a SubjectEntity with correct userId', () => {
      const { subject } = facade.createInitialStudyData(userId);

      expect(subject).toBeInstanceOf(SubjectEntity);
      expect(subject.userId).toBe(userId);
      expect(subject.title).toBe('Intro to Smart Study');
      expect(subject.color).toBe('#4CAF50');
    });

    it('✅ should create a TeacherEntity with correct userId and system name', () => {
      const { teacher } = facade.createInitialStudyData(userId);

      expect(teacher).toBeInstanceOf(TeacherEntity);
      expect(teacher.userId).toBe(userId);
      expect(teacher.name).toBe('StudyHub Guide');
      expect(teacher.contacts).toBe('welcome@studyhub.app');
    });

    it('✅ should generate unique IDs for subject and teacher', () => {
      const { subject, teacher } = facade.createInitialStudyData(userId);

      expect(subject.id).toBeDefined();
      expect(teacher.id).toBeDefined();
      expect(subject.id).not.toBe(teacher.id);
    });

    it('✅ should compose subject with exactly 1 schedule slot (via Builder)', () => {
      const { subject } = facade.createInitialStudyData(userId);

      expect(subject.scheduleSlots).toHaveLength(1);
    });

    it('✅ should create a LECTURE schedule slot with correct details', () => {
      const { subject } = facade.createInitialStudyData(userId);
      const slot = subject.scheduleSlots[0];

      expect(slot.classType).toBe(ClassType.LECTURE);
      expect(slot.startTime).toBe('08:00');
      expect(slot.endTime).toBe('09:30');
      expect(slot.location).toBe('Virtual Classroom');
      expect(slot.weekNumber).toBe(1);
      expect(slot.dayOfWeek).toBe(1);
    });

    it('✅ should link schedule slot to the created teacher', () => {
      const { subject, teacher } = facade.createInitialStudyData(userId);
      const slot = subject.scheduleSlots[0];

      expect(slot.teacherId).toBe(teacher.id);
    });

    it('✅ should compose subject with exactly 1 task (via Builder)', () => {
      const { subject } = facade.createInitialStudyData(userId);

      expect(subject.tasks).toHaveLength(1);
    });

    it('✅ should create a task with TODO status and HIGH priority', () => {
      const { subject } = facade.createInitialStudyData(userId);
      const task = subject.tasks[0];

      expect(task.title).toBe('Explore the Dashboard');
      expect(task.status).toBe(TaskStatus.TODO);
      expect(task.priority).toBe(TaskPriority.HIGH);
      expect(task.userId).toBe(userId);
      expect(task.description).toBeDefined();
    });

    it('✅ should set task deadline to 3 days from now', () => {
      const { subject } = facade.createInitialStudyData(userId);
      const task = subject.tasks[0];

      expect(task.deadline).toBeInstanceOf(Date);

      const now = new Date();
      const expectedMin = new Date(now);
      expectedMin.setDate(expectedMin.getDate() + 2);
      const expectedMax = new Date(now);
      expectedMax.setDate(expectedMax.getDate() + 4);

      expect(task.deadline!.getTime()).toBeGreaterThan(expectedMin.getTime());
      expect(task.deadline!.getTime()).toBeLessThan(expectedMax.getTime());
    });

    it('✅ should generate different IDs on each invocation (idempotent facade)', () => {
      const result1 = facade.createInitialStudyData(userId);
      const result2 = facade.createInitialStudyData(userId);

      expect(result1.subject.id).not.toBe(result2.subject.id);
      expect(result1.teacher.id).not.toBe(result2.teacher.id);
    });

    it('✅ should link schedule slot subjectId to the subject', () => {
      const { subject } = facade.createInitialStudyData(userId);
      const slot = subject.scheduleSlots[0];

      expect(slot.subjectId).toBe(subject.id);
    });

    it('✅ should link task subjectId to the subject', () => {
      const { subject } = facade.createInitialStudyData(userId);
      const task = subject.tasks[0];

      expect(task.subjectId).toBe(subject.id);
    });
  });
});
