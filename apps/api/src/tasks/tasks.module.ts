import { Module } from '@nestjs/common';
import { TaskController } from './presentation/task.controller';
import { TaskService } from './application/task.service';
import { PrismaTaskRepository } from './infrastructure/prisma-task.repository';

@Module({
  controllers: [TaskController],
  providers: [
    TaskService,
    {
      provide: 'ITaskRepository',
      useClass: PrismaTaskRepository,
    },
  ],
})
export class TasksModule {}
