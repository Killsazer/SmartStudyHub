import { Module } from '@nestjs/common';
import { SubjectsModule } from '../subjects/subjects.module';
import { ScheduleModule } from '../schedule/schedule.module';
import { OnboardingController } from './presentation/onboarding.controller';
import { OnboardingService } from './application/onboarding.service';
import { OnboardingFacade } from './application/onboarding.facade';
import { TeachersModule } from '../teachers/teachers.module';

@Module({
  imports: [
    SubjectsModule,
    ScheduleModule,
    TeachersModule,
  ],
  controllers: [OnboardingController],
  providers: [
    OnboardingService,
    {
      provide: OnboardingFacade,
      useClass: OnboardingFacade,
    },
  ],
})
export class OnboardingModule {}