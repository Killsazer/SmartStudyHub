// File: src/subjects/subjects.module.ts
import { Module } from '@nestjs/common';
import { OnboardingController } from './presentation/controlers/onboarding.controller';
import { SubjectController } from './presentation/controlers/subject.controller';
import { OnboardingService } from './application/onboarding.service';
import { SubjectService } from './application/subject.service';
import { SubjectQueryService } from './application/subject-query.service';
import { SharedProvidersModule } from '../shared/shared-providers.module';

@Module({
  imports: [SharedProvidersModule],
  controllers: [OnboardingController, SubjectController],
  providers: [
    OnboardingService,
    SubjectService,
    SubjectQueryService,
  ],
})
export class SubjectsModule {}
