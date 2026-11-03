export type Review = {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
};

export type ReviewSummary = {
  average: number;
  count: number;
  reviews: Review[];
};

export interface ReviewsAdapter {
  readonly providerName: string;
  getProductReviews(productId: string): Promise<ReviewSummary>;
}

export class IntegrationUnavailableError extends Error {
  constructor(readonly provider: string) {
    super(`${provider} is temporarily unavailable`);
    this.name = 'IntegrationUnavailableError';
  }
}
