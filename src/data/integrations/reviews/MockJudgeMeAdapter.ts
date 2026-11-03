import { IntegrationUnavailableError, type Review, type ReviewSummary, type ReviewsAdapter } from './types';

const AUTHORS = ['Jordan P.', 'Sam K.', 'Alex R.', 'Taylor M.', 'Casey L.', 'Riley B.'];
const SNIPPETS: [string, string][] = [
  ['Perfect fit', 'True to size and holds up after plenty of washes.'],
  ['My new favourite', 'Super comfortable for training and everyday wear.'],
  ['Great quality', 'Fabric feels premium. Would buy again in another colour.'],
  ['Runs slightly small', 'Love it, but consider sizing up if between sizes.'],
];

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

export class MockJudgeMeAdapter implements ReviewsAdapter {
  readonly providerName = 'Judge.me';

  constructor(private readonly options: { simulateOutage: boolean; latencyMs?: number }) {}

  async getProductReviews(productId: string): Promise<ReviewSummary> {
    await new Promise((r) => setTimeout(r, this.options.latencyMs ?? 500));
    if (this.options.simulateOutage) throw new IntegrationUnavailableError(this.providerName);

    const seed = hash(productId);
    const count = seed % 5 === 0 ? 0 : 3 + (seed % 40);
    const reviews: Review[] = Array.from({ length: Math.min(count, 3) }, (_, i) => {
      const [title, body] = SNIPPETS[(seed + i) % SNIPPETS.length];
      return {
        id: `${productId}-r${i}`,
        author: AUTHORS[(seed + i) % AUTHORS.length],
        rating: 5 - ((seed + i) % 3 === 0 ? 1 : 0),
        title,
        body,
        verified: i % 2 === 0,
      };
    });
    const average = count ? Math.round((4.2 + (seed % 8) / 10) * 10) / 10 : 0;
    return { average: Math.min(average, 5), count, reviews };
  }
}
