import { ScheduleSlotFactory, LectureSlot, LabSlot, PracticeSlot } from './schedule-slot.factory';
import { ClassType, ScheduleSlotEntity, ScheduleSlotProps } from '../schedule-slot.entity';

const defaultProps: ScheduleSlotProps = {
  id: 'slot-1',
  userId: 'u1',
  subjectId: 'subj-1',
  teacherId: 'teacher-1',
  weekNumber: 1,
  dayOfWeek: 1,
  startTime: '08:00',
  endTime: '09:30',
  location: 'Room 301',
};

describe('ScheduleSlotFactory', () => {
  describe('createSlot() — correct subclass creation', () => {
    it('✅ LECTURE → LectureSlot', () => {
      const slot = ScheduleSlotFactory.createSlot(ClassType.LECTURE, defaultProps);

      expect(slot).toBeInstanceOf(LectureSlot);
      expect(slot.classType).toBe(ClassType.LECTURE);
    });

    it('✅ LAB → LabSlot', () => {
      const slot = ScheduleSlotFactory.createSlot(ClassType.LAB, defaultProps);

      expect(slot).toBeInstanceOf(LabSlot);
      expect(slot.classType).toBe(ClassType.LAB);
    });

    it('✅ PRACTICE → PracticeSlot', () => {
      const slot = ScheduleSlotFactory.createSlot(ClassType.PRACTICE, defaultProps);

      expect(slot).toBeInstanceOf(PracticeSlot);
      expect(slot.classType).toBe(ClassType.PRACTICE);
    });

    it('❌ should throw Error for invalid class type', () => {
      expect(() => ScheduleSlotFactory.createSlot('SEMINAR' as ClassType, defaultProps))
        .toThrow('Invalid class type: SEMINAR');
    });
  });

  describe('createSlot() — props mapping', () => {
    it('✅ should map all props correctly to entity', () => {
      const slot = ScheduleSlotFactory.createSlot(ClassType.LECTURE, defaultProps);

      expect(slot.id).toBe('slot-1');
      expect(slot.userId).toBe('u1');
      expect(slot.subjectId).toBe('subj-1');
      expect(slot.teacherId).toBe('teacher-1');
      expect(slot.weekNumber).toBe(1);
      expect(slot.dayOfWeek).toBe(1);
      expect(slot.startTime).toBe('08:00');
      expect(slot.endTime).toBe('09:30');
      expect(slot.location).toBe('Room 301');
    });

    it('✅ should handle null teacherId', () => {
      const props = { ...defaultProps, teacherId: null };
      const slot = ScheduleSlotFactory.createSlot(ClassType.LAB, props);

      expect(slot.teacherId).toBeNull();
    });

    it('✅ should handle undefined location', () => {
      const { location, ...propsWithoutLocation } = defaultProps;
      const slot = ScheduleSlotFactory.createSlot(ClassType.PRACTICE, propsWithoutLocation as ScheduleSlotProps);

      expect(slot.location).toBeUndefined();
    });
  });

  describe('getSlotDetails() — polymorphic behavior', () => {
    it('✅ LectureSlot returns lecture-specific details', () => {
      const slot = ScheduleSlotFactory.createSlot(ClassType.LECTURE, defaultProps);
      const details = slot.getSlotDetails();

      expect(details).toContain('Lecture');
      expect(details).toContain('08:00');
      expect(details).toContain('09:30');
      expect(details).toContain('Room 301');
    });

    it('✅ LabSlot returns lab-specific details', () => {
      const slot = ScheduleSlotFactory.createSlot(ClassType.LAB, defaultProps);
      const details = slot.getSlotDetails();

      expect(details).toContain('Lab');
      expect(details).toContain('Practical application');
    });

    it('✅ PracticeSlot returns practice-specific details', () => {
      const slot = ScheduleSlotFactory.createSlot(ClassType.PRACTICE, defaultProps);
      const details = slot.getSlotDetails();

      expect(details).toContain('Practice');
      expect(details).toContain('Group exercises');
    });

    it('✅ should use TBD when location is undefined', () => {
      const { location, ...props } = defaultProps;
      const slot = ScheduleSlotFactory.createSlot(ClassType.LECTURE, props as ScheduleSlotProps);

      expect(slot.getSlotDetails()).toContain('TBD');
    });
  });

  describe('domain purity', () => {
    it('✅ all subclasses extend ScheduleSlotEntity', () => {
      const lecture = ScheduleSlotFactory.createSlot(ClassType.LECTURE, defaultProps);
      const lab = ScheduleSlotFactory.createSlot(ClassType.LAB, defaultProps);
      const practice = ScheduleSlotFactory.createSlot(ClassType.PRACTICE, defaultProps);

      expect(lecture).toBeInstanceOf(ScheduleSlotEntity);
      expect(lab).toBeInstanceOf(ScheduleSlotEntity);
      expect(practice).toBeInstanceOf(ScheduleSlotEntity);
    });

    it('✅ factory is a pure static method (no DI needed)', () => {
      expect(typeof ScheduleSlotFactory.createSlot).toBe('function');
    });
  });
});
