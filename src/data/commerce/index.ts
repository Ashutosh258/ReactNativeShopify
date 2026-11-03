import { store } from '@/config';
import type { CommerceClient } from './CommerceClient';
import { MockClient } from './mock/MockClient';
import { ShopifyClient } from './shopify/ShopifyClient';

function createClient(): CommerceClient {
  const source = store.commerce;
  if (source.provider === 'shopify') return new ShopifyClient(source);
  return new MockClient({
    storeId: store.id,
    latencyMs: source.latencyMs,
    failFirstRequest: process.env.EXPO_PUBLIC_SIMULATE_ERRORS === '1',
  });
}

export const commerce = createClient();
export { CommerceError } from './CommerceClient';
export type { CommerceClient } from './CommerceClient';
