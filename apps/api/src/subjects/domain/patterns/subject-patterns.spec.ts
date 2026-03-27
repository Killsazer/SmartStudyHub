// File: src/subjects/domain/patterns/subject-patterns.spec.ts
// Covers: Builder (SubjectBuilder), Factory Method (LessonFactory)
import { SubjectBuilder } from './subject.builder';
import { LessonFactory, LessonType, LectureLesson, LabLesson, SeminarLesson } from './lesson.factory';
import { SubjectEntity } from '../subject.entity';
import { TaskEntity, TaskStatus, TaskPriority } from '../../../tasks/domain/task.entity';

// ═══════════════════════════════════════════════════════════════
// BUILDER PATTERN
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

  it('✅ fluent API — setTeacher and setColor should return `this` for chaining', () => {
    const builder = new SubjectBuilder('s1', 'Math', 'u1');

    const result = builder.setTeacher('Prof. Smith').setColor('#FF0000');

    // Chaining should work and return the same builder
    expect(result).toBe(builder);

    const subject = result.build();
    expect(subject.teacherName).toBe('Prof. Smith');
    expect(subject.color).toBe('#FF0000');
  });

  it('✅ should use default color #000000 when setColor is not called', () => {
    const subject = new SubjectBuilder('s1', 'Physics', 'u1').build();

    expect(subject.color).toBe('#000000');
  });

  it('✅ addLesson() should accumulate lessons', () => {
    const lesson = LessonFactory.createLesson(LessonType.LECTURE, {
      id: 'l1', title: 'Intro', subjectId: 's1',
      startTime: new Date(), endTime: new Date(),
    });

    const subject = new SubjectBuilder('s1', 'CS', 'u1')
      .addLesson(lesson)
      .build();

    expect(subject.lessons.length).toBe(1);
    expect(subject.lessons[0].type).toBe(LessonType.LECTURE);
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
    const lesson = LessonFactory.createLesson(LessonType.LAB, {
      id: 'l1', title: 'Practical', subjectId: 's1',
      startTime: new Date(), endTime: new Date(), location: 'Room 305'
    });
    const task = new TaskEntity('t1', 'Lab report', TaskStatus.TODO, TaskPriority.HIGH, 'u1');

    const subject = new SubjectBuilder('s1', 'OOP', 'u1')
      .setTeacher('Dr. Johnson')
      .setColor('#2196F3')
      .addLesson(lesson)
      .addTask(task)
      .build();

    expect(subject.teacherName).toBe('Dr. Johnson');
    expect(subject.color).toBe('#2196F3');
    expect(subject.lessons.length).toBe(1);
    expect(subject.tasks.length).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════
// FACTORY METHOD PATTERN
// ═══════════════════════════════════════════════════════════════

describe('LessonFactory', () => {
  const lessonProps = {
    id: 'l-1',
    title: 'Test Lesson',
    subjectId: 'subj-1',
    startTime: new Date('2026-09-01T09:00:00'),
    endTime: new Date('2026-09-01T10:30:00'),
    location: 'Room 101',
  };

  it('✅ should create LectureLesson for LECTURE type', () => {
    const lesson = LessonFactory.createLesson(LessonType.LECTURE, lessonProps);

    expect(lesson).toBeInstanceOf(LectureLesson);
    expect(lesson.type).toBe(LessonType.LECTURE);
    expect(lesson.props.title).toBe('Test Lesson');
  });

  it('✅ should create LabLesson for LAB type', () => {
    const lesson = LessonFactory.createLesson(LessonType.LAB, lessonProps);

    expect(lesson).toBeInstanceOf(LabLesson);
    expect(lesson.type).toBe(LessonType.LAB);
  });

  it('✅ should create SeminarLesson for SEMINAR type', () => {
    const lesson = LessonFactory.createLesson(LessonType.SEMINAR, lessonProps);

    expect(lesson).toBeInstanceOf(SeminarLesson);
    expect(lesson.type).toBe(LessonType.SEMINAR);
  });

  it('❌ should throw Error for invalid lesson type', () => {
    expect(() => {
      LessonFactory.createLesson('WORKSHOP' as LessonType, lessonProps);
    }).toThrow('Invalid lesson type');
  });

  it('✅ getLessonDetails() should return descriptive string for each type', () => {
    const lecture = LessonFactory.createLesson(LessonType.LECTURE, lessonProps);
    const lab = LessonFactory.createLesson(LessonType.LAB, lessonProps);
    const seminar = LessonFactory.createLesson(LessonType.SEMINAR, lessonProps);

    expect(lecture.getLessonDetails()).toContain('Lecture');
    expect(lecture.getLessonDetails()).toContain('Room 101');
    expect(lab.getLessonDetails()).toContain('Laboratory');
    expect(seminar.getLessonDetails()).toContain('Seminar');
  });
});
