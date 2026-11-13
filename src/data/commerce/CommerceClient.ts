import type { Checkout, CheckoutLine, Collection, Product, VariantSnapshot } from '../types';

export interface CommerceClient {
  readonly isSampleData: boolean;
  getCollection(handle: string): Promise<Collection>;
  getProduct(handle: string): Promise<Product>;
  getVariants(ids: string[]): Promise<VariantSnapshot[]>;
  createCheckout(lines: CheckoutLine[]): Promise<Checkout>;
  isCheckoutCompleted(cartId: string): Promise<boolean>;
}

export class CommerceError extends Error {
  constructor(message: string, readonly retryable = true) {
    super(message);
    this.name = 'CommerceError';
  }
}
