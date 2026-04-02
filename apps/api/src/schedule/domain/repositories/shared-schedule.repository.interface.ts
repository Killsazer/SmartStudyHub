export interface ScheduleSnapshotData {
  subjects: Array<{ id: string; title: string; color: string }>;
  teachers: Array<{ id: string; name: string; photoUrl?: string; contacts?: string }>;
  slots: Array<{
    subjectId: string;
    teacherId: string | null;
    weekNumber: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    classType: string;
    location?: string;
  }>;
}

export interface SharedScheduleData {
  id: string;
  hashToken: string;
  snapshotData: ScheduleSnapshotData;
  userId: string;
}

export interface ISharedScheduleRepository {
  save(data: SharedScheduleData): Promise<void>;
  findByHashToken(hashToken: string): Promise<SharedScheduleData | null>;
}
