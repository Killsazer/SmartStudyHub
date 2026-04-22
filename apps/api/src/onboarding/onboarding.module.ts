import { Module } from "@nestjs/common";
import { SubjectsModule } from "../subjects/subjects.module";
import { ScheduleModule } from "../schedule/schedule.module";
import { TasksModule } from "../tasks/tasks.module";
import { OnboardingController } from "./presentation/onboarding.controller";
import { OnboardingService } from "./application/onboarding.service";
import { OnboardingFacade } from "./domain/patterns/onboarding.facade";

@Module({
  imports: [
    SubjectsModule, 
    ScheduleModule,
    TasksModule,
  ],
  controllers: [OnboardingController],
  providers: [
    OnboardingService,
    OnboardingFacade,
  ],
})
export class OnboardingModule {}
