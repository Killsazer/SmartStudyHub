import { Module } from '@nestjs/common';
import { TaskController } from './presentation/task.controller';
import { TaskService } from './application/task.service';
import { PrismaTaskRepository } from './infrastructure/prisma-task.repository';
import { CommandHistoryManager } from './domain/patterns/command/command-history.manager';

@Module({
  controllers: [TaskController],
  providers: [
    TaskService,
    CommandHistoryManager,
    {
      provide: 'ITaskRepository',
      useClass: PrismaTaskRepository,
    },
  ],
})
export class TasksModule {}
