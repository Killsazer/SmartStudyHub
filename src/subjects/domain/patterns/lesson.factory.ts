export enum LessonType {
  LECTURE = 'LECTURE',
  LAB = 'LAB',
  SEMINAR = 'SEMINAR',
}

export interface LessonProps {
  id: string;
  title: string;
  subjectId: string;
  startTime: Date;
  endTime: Date;
  location?: string;
}

export abstract class BaseLesson {
  abstract readonly type: LessonType;

  constructor(public props: LessonProps) {}

  abstract getLessonDetails(): string;
}

export class LectureLesson extends BaseLesson {
  readonly type = LessonType.LECTURE;

  getLessonDetails(): string {
    return `Lecture: ${this.props.title} at ${this.props.location}. Focuses on theoretical concepts.`;
  }
}

export class LabLesson extends BaseLesson {
  readonly type = LessonType.LAB;

  getLessonDetails(): string {
    return `Laboratory: ${this.props.title} at ${this.props.location}. Focuses on practical application.`;
  }
}

export class SeminarLesson extends BaseLesson {
  readonly type = LessonType.SEMINAR;

  getLessonDetails(): string {
    return `Seminar: ${this.props.title} at ${this.props.location}. Focuses on group discussion.`;
  }
}

export class LessonFactory {
  static createLesson(type: LessonType, props: LessonProps): BaseLesson {
    switch (type) {
      case LessonType.LECTURE:
        return new LectureLesson(props);
      case LessonType.LAB:
        return new LabLesson(props);
      case LessonType.SEMINAR:
        return new SeminarLesson(props);
      default:
        throw new Error('Invalid lesson type');
    }
  }
}