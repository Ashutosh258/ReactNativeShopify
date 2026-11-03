import { store } from '@/config';
import { MockJudgeMeAdapter } from './MockJudgeMeAdapter';
import type { ReviewsAdapter } from './types';

function createReviewsAdapter(): ReviewsAdapter | null {
  const config = store.integrations.reviews;
  if (!config) return null;
  switch (config.provider) {
    case 'judgeme':
      return new MockJudgeMeAdapter({ simulateOutage: config.simulateOutage });
    default:
      return null;
  }
}

export const reviews = createReviewsAdapter();
export * from './types';
