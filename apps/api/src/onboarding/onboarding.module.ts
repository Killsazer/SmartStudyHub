import { Module } from '@nestjs/common';
import { SubjectsModule } from '../subjects/subjects.module';
import { ScheduleModule } from '../schedule/schedule.module';
import { OnboardingController } from './presentation/onboarding.controller';
import { OnboardingFacade } from './application/onboarding.facade';
import { TeachersModule } from '../teachers/teachers.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    SubjectsModule,
    ScheduleModule,
    TeachersModule,
    TasksModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingFacade],
})
export class OnboardingModule {}