import { Injectable } from '@nestjs/common';
import { ISharedScheduleRepository, SharedScheduleData, ScheduleSnapshotData } from '../../../domain/repositories/shared-schedule.repository.interface';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import type { Prisma } from '@prisma/client';

@Injectable()
export class PrismaSharedScheduleRepository implements ISharedScheduleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: SharedScheduleData): Promise<void> {
    await this.prisma.sharedSchedule.create({
      data: {
        id: data.id,
        hashToken: data.hashToken,
        snapshotData: data.snapshotData as unknown as Prisma.InputJsonValue,
        userId: data.userId,
      },
    });
  }

  async findByHashToken(hashToken: string): Promise<SharedScheduleData | null> {
    const d = await this.prisma.sharedSchedule.findUnique({ where: { hashToken } });
    if (!d) return null;
    return {
      id: d.id,
      hashToken: d.hashToken,
      snapshotData: d.snapshotData as unknown as ScheduleSnapshotData,
      userId: d.userId,
    };
  }
}
