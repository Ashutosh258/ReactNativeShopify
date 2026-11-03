import Constants from 'expo-constants';
import { DEFAULT_STORE_ID, stores } from './stores';
import type { CommerceSource, StoreConfig } from './types';

type ShopifySource = Extract<CommerceSource, { provider: 'shopify' }>;

type Extra = {
  storeId?: string;
  shopify?: Omit<ShopifySource, 'provider'> | null;
};

function resolveStore(): StoreConfig {
  const extra = (Constants.expoConfig?.extra ?? {}) as Extra;
  const base = stores[extra.storeId ?? DEFAULT_STORE_ID] ?? stores[DEFAULT_STORE_ID];
  if (!extra.shopify?.domain) return base;
  return { ...base, commerce: { provider: 'shopify', ...extra.shopify } };
}

export const store = resolveStore();
export type { StoreConfig } from './types';
