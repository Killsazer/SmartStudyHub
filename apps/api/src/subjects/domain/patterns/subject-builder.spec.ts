import { SubjectBuilder } from './subject.builder';
import { SubjectEntity } from '../subject.entity';
import { TaskEntity, TaskStatus, TaskPriority } from '../../../tasks/domain/task.entity';
import { ScheduleSlotFactory } from '../../../schedule/domain/patterns/schedule-slot.factory';
import { ClassType } from '../../../schedule/domain/schedule-slot.entity';

describe('SubjectBuilder', () => {
  const defaultProps = { id: 'subj-1', title: 'Clean Architecture', userId: 'u1' };

  describe('build() — basic creation', () => {
    it('✅ should create a valid SubjectEntity with required fields', () => {
      const subject = new SubjectBuilder(defaultProps.id, defaultProps.title, defaultProps.userId).build();

      expect(subject).toBeInstanceOf(SubjectEntity);
      expect(subject.id).toBe('subj-1');
      expect(subject.title).toBe('Clean Architecture');
      expect(subject.userId).toBe('u1');
    });

    it('✅ should use default color #000000 when setColor is not called', () => {
      const subject = new SubjectBuilder('s1', 'Physics', 'u1').build();

      expect(subject.color).toBe('#000000');
    });

    it('✅ should trim whitespace from title', () => {
      const subject = new SubjectBuilder('s1', '  Math  ', 'u1').build();

      expect(subject.title).toBe('Math');
    });

    it('✅ should initialize empty arrays for tasks, scheduleSlots, notes', () => {
      const subject = new SubjectBuilder('s1', 'Art', 'u1').build();

      expect(subject.tasks).toEqual([]);
      expect(subject.scheduleSlots).toEqual([]);
      expect(subject.notes).toEqual([]);
    });
  });

  describe('setColor() — fluent API + validation', () => {
    it('✅ should return `this` for chaining', () => {
      const builder = new SubjectBuilder('s1', 'Math', 'u1');
      const result = builder.setColor('#FF0000');

      expect(result).toBe(builder);

      const subject = result.build();
      expect(subject.color).toBe('#FF0000');
    });

    it('✅ should accept valid 6-char HEX color', () => {
      const subject = new SubjectBuilder('s1', 'X', 'u1').setColor('#4CAF50').build();
      expect(subject.color).toBe('#4CAF50');
    });

    it('✅ should accept valid 3-char HEX color', () => {
      const subject = new SubjectBuilder('s1', 'X', 'u1').setColor('#FFF').build();
      expect(subject.color).toBe('#FFF');
    });

    it('❌ should throw Error for invalid color (no hash)', () => {
      expect(() => new SubjectBuilder('s1', 'X', 'u1').setColor('FF0000'))
        .toThrow('Invalid color format');
    });

    it('❌ should throw Error for invalid color (wrong chars)', () => {
      expect(() => new SubjectBuilder('s1', 'X', 'u1').setColor('#ZZZZZZ'))
        .toThrow('Invalid color format');
    });

    it('❌ should throw Error for empty color string', () => {
      expect(() => new SubjectBuilder('s1', 'X', 'u1').setColor(''))
        .toThrow('Invalid color format');
    });
  });

  describe('constructor — Fail Fast validation', () => {
    it('❌ should throw Error for empty title', () => {
      expect(() => new SubjectBuilder('s1', '', 'u1')).toThrow('Subject title cannot be empty');
    });

    it('❌ should throw Error for whitespace-only title', () => {
      expect(() => new SubjectBuilder('s1', '   ', 'u1')).toThrow('Subject title cannot be empty');
    });

    it('❌ should throw Error for title exceeding 100 characters', () => {
      const longTitle = 'A'.repeat(101);
      expect(() => new SubjectBuilder('s1', longTitle, 'u1')).toThrow('Subject title too long');
    });

    it('✅ should accept title with exactly 100 characters', () => {
      const title100 = 'A'.repeat(100);
      expect(() => new SubjectBuilder('s1', title100, 'u1')).not.toThrow();
    });

    it('❌ should throw Error for empty userId', () => {
      expect(() => new SubjectBuilder('s1', 'Valid', '')).toThrow('Subject userId cannot be empty');
    });
  });

  describe('addScheduleSlot() + addTask() — composition', () => {
    it('✅ addScheduleSlot() should add slot to subject', () => {
      const slot = ScheduleSlotFactory.createSlot(ClassType.LECTURE, {
        id: 'slot-1', userId: 'u1', subjectId: 'subj-1', teacherId: null,
        weekNumber: 1, dayOfWeek: 1, startTime: '08:00', endTime: '09:30',
      });

      const subject = new SubjectBuilder('subj-1', 'Math', 'u1')
        .addScheduleSlot(slot)
        .build();

      expect(subject.scheduleSlots).toHaveLength(1);
      expect(subject.scheduleSlots[0].id).toBe('slot-1');
    });

    it('✅ addTask() should add task to subject', () => {
      const task = new TaskEntity({
        id: 'task-1', title: 'Homework', status: TaskStatus.TODO,
        priority: TaskPriority.HIGH, userId: 'u1', subjectId: 'subj-1',
      });

      const subject = new SubjectBuilder('subj-1', 'Math', 'u1')
        .addTask(task)
        .build();

      expect(subject.tasks).toHaveLength(1);
      expect(subject.tasks[0].id).toBe('task-1');
    });

    it('✅ should support adding multiple slots and tasks', () => {
      const slot1 = ScheduleSlotFactory.createSlot(ClassType.LECTURE, {
        id: 'sl-1', userId: 'u1', subjectId: 's1', teacherId: null,
        weekNumber: 1, dayOfWeek: 1, startTime: '08:00', endTime: '09:30',
      });
      const slot2 = ScheduleSlotFactory.createSlot(ClassType.LAB, {
        id: 'sl-2', userId: 'u1', subjectId: 's1', teacherId: null,
        weekNumber: 1, dayOfWeek: 3, startTime: '10:00', endTime: '11:30',
      });
      const task = new TaskEntity({
        id: 't-1', title: 'Lab report', status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM, userId: 'u1',
      });

      const subject = new SubjectBuilder('s1', 'Science', 'u1')
        .addScheduleSlot(slot1)
        .addScheduleSlot(slot2)
        .addTask(task)
        .build();

      expect(subject.scheduleSlots).toHaveLength(2);
      expect(subject.tasks).toHaveLength(1);
    });
  });

  describe('build() — reset protection', () => {
    it('✅ should reset builder state after build() to prevent mutation', () => {
      const builder = new SubjectBuilder('s1', 'Math', 'u1');
      builder.setColor('#FF0000');

      const first = builder.build();
      expect(first.color).toBe('#FF0000');

      const second = builder.build();
      expect(second.color).toBe('#000000');
      expect(second.scheduleSlots).toEqual([]);
    });

    it('✅ should produce independent entities on consecutive builds', () => {
      const builder = new SubjectBuilder('s1', 'Math', 'u1');

      const first = builder.build();
      const second = builder.build();

      expect(first).not.toBe(second);
    });
  });
});
