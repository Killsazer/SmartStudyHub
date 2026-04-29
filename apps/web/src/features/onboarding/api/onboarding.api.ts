import { apiClient } from '../../../shared/api/client';

export const startOnboarding = async (): Promise<void> => {
  await apiClient.post('/onboarding');
};
