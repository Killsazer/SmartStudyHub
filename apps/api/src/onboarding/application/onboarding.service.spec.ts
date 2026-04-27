import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingFacade } from './onboarding.facade';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let mockFacade: jest.Mocked<OnboardingFacade>;

  beforeEach(async () => {
    // Create mock for the facade
    const facadeMock = {
      createInitialStudyData: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        { provide: OnboardingFacade, useValue: facadeMock },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
    mockFacade = module.get(OnboardingFacade);
  });

  describe('processNewUserOnboarding — success', () => {
    it('✅ should call Facade to create initial study data', async () => {
      const userId = 'user-1';
      mockFacade.createInitialStudyData.mockResolvedValue({} as any);

      await service.processNewUserOnboarding(userId);

      expect(mockFacade.createInitialStudyData).toHaveBeenCalledTimes(1);
      expect(mockFacade.createInitialStudyData).toHaveBeenCalledWith(userId);
    });
  });

  describe('processNewUserOnboarding — errors', () => {
    it('❌ should throw BadRequestException for empty userId (Fail Fast)', async () => {
      await expect(service.processNewUserOnboarding('')).rejects.toThrow(BadRequestException);

      expect(mockFacade.createInitialStudyData).not.toHaveBeenCalled();
    });

    it('❌ should throw BadRequestException for non-string userId', async () => {
      await expect(service.processNewUserOnboarding(123 as any)).rejects.toThrow(BadRequestException);

      expect(mockFacade.createInitialStudyData).not.toHaveBeenCalled();
    });

    it('❌ should propagate Facade errors', async () => {
      const userId = 'user-1';
      mockFacade.createInitialStudyData.mockRejectedValue(new Error('Facade Error'));

      await expect(service.processNewUserOnboarding(userId)).rejects.toThrow('Facade Error');
    });
  });
});
