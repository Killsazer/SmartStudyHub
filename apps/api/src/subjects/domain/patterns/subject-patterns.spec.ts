// File: src/subjects/domain/patterns/subject-patterns.spec.ts
// Covers: Builder (SubjectBuilder), Factory Method (ScheduleSlotFactory via re-export)
import { SubjectBuilder } from './subject.builder';
import { ScheduleSlotFactory, ClassType, LectureSlot, LabSlot, PracticeSlot } from '../../../schedule/domain/patterns/schedule-slot.factory';
import { SubjectEntity } from '../subject.entity';
import { TaskEntity, TaskStatus, TaskPriority } from '../../../tasks/domain/task.entity';

// ═══════════════════════════════════════════════════════════════
// BUILDER PATTERN (adapted for schedule-centric model)
// ═══════════════════════════════════════════════════════════════

describe('SubjectBuilder', () => {
  const defaultProps = { id: 'subj-1', title: 'Clean Architecture', userId: 'u1' };

  it('✅ build() should create a valid SubjectEntity with required fields', () => {
    const subject = new SubjectBuilder(defaultProps.id, defaultProps.title, defaultProps.userId).build();

    expect(subject).toBeInstanceOf(SubjectEntity);
    expect(subject.id).toBe('subj-1');
    expect(subject.title).toBe('Clean Architecture');
    expect(subject.userId).toBe('u1');
  });

  it('✅ fluent API — setColor should return `this` for chaining', () => {
    const builder = new SubjectBuilder('s1', 'Math', 'u1');

    const result = builder.setColor('#FF0000');

    // Chaining should work and return the same builder
    expect(result).toBe(builder);

    const subject = result.build();
    expect(subject.color).toBe('#FF0000');
  });

  it('✅ should use default color #000000 when setColor is not called', () => {
    const subject = new SubjectBuilder('s1', 'Physics', 'u1').build();

    expect(subject.color).toBe('#000000');
  });

  it('✅ addScheduleSlot() should accumulate schedule slots', () => {
    const slot = ScheduleSlotFactory.createSlot(ClassType.LECTURE, {
      id: 'sl1', userId: 'u1', subjectId: 's1', teacherId: null,
      weekNumber: 1, dayOfWeek: 1, startTime: '09:00', endTime: '10:30',
    });

    const subject = new SubjectBuilder('s1', 'CS', 'u1')
      .addScheduleSlot(slot)
      .build();

    expect(subject.scheduleSlots.length).toBe(1);
    expect(subject.scheduleSlots[0].classType).toBe(ClassType.LECTURE);
  });

  it('✅ addTask() should accumulate tasks', () => {
    const task = new TaskEntity('t1', 'Read chapter', TaskStatus.TODO, TaskPriority.MEDIUM, 'u1');

    const subject = new SubjectBuilder('s1', 'CS', 'u1')
      .addTask(task)
      .build();

    expect(subject.tasks.length).toBe(1);
    expect(subject.tasks[0].title).toBe('Read chapter');
  });

  it('✅ full fluent chain should produce a complete Subject', () => {
    const slot = ScheduleSlotFactory.createSlot(ClassType.LAB, {
      id: 'sl1', userId: 'u1', subjectId: 's1', teacherId: 't1',
      weekNumber: 1, dayOfWeek: 3, startTime: '14:00', endTime: '15:30',
      location: 'Room 305',
    });
    const task = new TaskEntity('t1', 'Lab report', TaskStatus.TODO, TaskPriority.HIGH, 'u1');

    const subject = new SubjectBuilder('s1', 'OOP', 'u1')
      .setColor('#2196F3')
      .addScheduleSlot(slot)
      .addTask(task)
      .build();

    expect(subject.color).toBe('#2196F3');
    expect(subject.scheduleSlots.length).toBe(1);
    expect(subject.tasks.length).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════
// FACTORY METHOD PATTERN (ScheduleSlotFactory — adapted from LessonFactory)
// ═══════════════════════════════════════════════════════════════

describe('ScheduleSlotFactory', () => {
  const slotProps = {
    id: 'sl-1',
    userId: 'u1',
    subjectId: 'subj-1',
    teacherId: 'teacher-1',
    weekNumber: 1,
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:30',
    location: 'Room 101',
  };

  it('✅ should create LectureSlot for LECTURE type', () => {
    const slot = ScheduleSlotFactory.createSlot(ClassType.LECTURE, slotProps);

    expect(slot).toBeInstanceOf(LectureSlot);
    expect(slot.classType).toBe(ClassType.LECTURE);
    expect(slot.props.startTime).toBe('09:00');
  });

  it('✅ should create LabSlot for LAB type', () => {
    const slot = ScheduleSlotFactory.createSlot(ClassType.LAB, slotProps);

    expect(slot).toBeInstanceOf(LabSlot);
    expect(slot.classType).toBe(ClassType.LAB);
  });

  it('✅ should create PracticeSlot for PRACTICE type', () => {
    const slot = ScheduleSlotFactory.createSlot(ClassType.PRACTICE, slotProps);

    expect(slot).toBeInstanceOf(PracticeSlot);
    expect(slot.classType).toBe(ClassType.PRACTICE);
  });

  it('❌ should throw Error for invalid class type', () => {
    expect(() => {
      ScheduleSlotFactory.createSlot('WORKSHOP' as ClassType, slotProps);
    }).toThrow('Invalid class type');
  });

  it('✅ getSlotDetails() should return descriptive string for each type', () => {
    const lecture = ScheduleSlotFactory.createSlot(ClassType.LECTURE, slotProps);
    const lab = ScheduleSlotFactory.createSlot(ClassType.LAB, slotProps);
    const practice = ScheduleSlotFactory.createSlot(ClassType.PRACTICE, slotProps);

    expect(lecture.getSlotDetails()).toContain('Лекція');
    expect(lecture.getSlotDetails()).toContain('Room 101');
    expect(lab.getSlotDetails()).toContain('Лабораторна');
    expect(practice.getSlotDetails()).toContain('Практика');
  });
});
