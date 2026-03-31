// File: src/schedule/infrastructure/prisma-shared-schedule.repository.ts
import { Injectable } from '@nestjs/common';
import { ISharedScheduleRepository, SharedScheduleData } from '../domain/shared-schedule.repository.interface';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class PrismaSharedScheduleRepository implements ISharedScheduleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: SharedScheduleData): Promise<void> {
    await this.prisma.sharedSchedule.create({
      data: {
        id: data.id,
        hashToken: data.hashToken,
        snapshotData: data.snapshotData,
        userId: data.userId,
      },
    });
    console.log(`[PrismaSharedScheduleRepo] Shared schedule saved with hash: ${data.hashToken}`);
  }

  async findByHashToken(hashToken: string): Promise<SharedScheduleData | null> {
    const d = await this.prisma.sharedSchedule.findUnique({ where: { hashToken } });
    if (!d) return null;
    return {
      id: d.id,
      hashToken: d.hashToken,
      snapshotData: d.snapshotData,
      userId: d.userId,
    };
  }
}
