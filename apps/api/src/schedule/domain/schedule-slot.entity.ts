export enum ClassType {
  LECTURE = 'LECTURE',
  LAB = 'LAB',
  PRACTICE = 'PRACTICE',
}

// Props для безпечної гідратації сутності
export interface ScheduleSlotProps {
  id: string;
  userId: string;
  subjectId: string;
  teacherId: string | null;
  weekNumber: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
}

// Базова доменна сутність. Вона ж виступає "Абстрактним продуктом" для патерна Factory Method.
export abstract class ScheduleSlotEntity {
  public readonly id: string;
  public readonly userId: string;
  public subjectId: string;
  public teacherId: string | null;
  public weekNumber: number;    
  public dayOfWeek: number;     
  public startTime: string;     
  public endTime: string;       
  public location?: string;

  // Кожен підклас зобов'язаний визначити свій тип
  abstract readonly classType: ClassType;

  constructor(props: ScheduleSlotProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.subjectId = props.subjectId;
    this.teacherId = props.teacherId;
    this.weekNumber = props.weekNumber;
    this.dayOfWeek = props.dayOfWeek;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.location = props.location;
  }

  // Поліморфний метод, який реалізується по-різному в залежності від типу заняття
  abstract getSlotDetails(): string;
}