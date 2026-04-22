// File: src/subjects/presentation/onboarding.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class OnboardingDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
