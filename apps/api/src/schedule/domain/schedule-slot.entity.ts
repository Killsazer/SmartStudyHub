export enum ClassType {
  LECTURE = 'LECTURE',
  LAB = 'LAB',
  PRACTICE = 'PRACTICE',
}

export class ScheduleSlotEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public subjectId: string,
    public teacherId: string | null,
    public weekNumber: number,    
    public dayOfWeek: number,     
    public startTime: string,     
    public endTime: string,       
    public classType: ClassType,
    public location?: string,
  ) {}
}
