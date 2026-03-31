// File: src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TasksModule } from './tasks/tasks.module';
import { NotesModule } from './notes/notes.module';
import { ScheduleModule } from './schedule/schedule.module';

@Module({
  imports: [PrismaModule, AuthModule, SubjectsModule, TasksModule, NotesModule, ScheduleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
