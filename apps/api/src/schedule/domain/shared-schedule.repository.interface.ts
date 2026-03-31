// File: src/schedule/domain/shared-schedule.repository.interface.ts

export interface SharedScheduleData {
  id: string;
  hashToken: string;
  snapshotData: any;
  userId: string;
}

export interface ISharedScheduleRepository {
  save(data: SharedScheduleData): Promise<void>;
  findByHashToken(hashToken: string): Promise<SharedScheduleData | null>;
}
