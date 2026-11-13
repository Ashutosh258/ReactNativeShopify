import type { CommerceClient } from '../CommerceClient';
import { CommerceError } from '../CommerceClient';
import type { Checkout, CheckoutLine, Collection, Product, VariantSnapshot } from '../../types';
import { buildProduct } from './buildProduct';
import { fixtures } from './fixtures';

type Options = { storeId: string; latencyMs: number; failFirstRequest: boolean };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockClient implements CommerceClient {
  readonly isSampleData = true;
  private readonly products: Product[];
  private readonly collection: { handle: string; title: string };
  private pendingFailure: boolean;

  constructor(private readonly options: Options) {
    const fixture = fixtures[options.storeId];
    if (!fixture) throw new Error(`No sample data for store "${options.storeId}"`);
    this.collection = fixture.collection;
    this.products = fixture.products.map((p) => buildProduct(p, fixture.currencyCode));
    this.pendingFailure = options.failFirstRequest;
  }

  private async simulate() {
    await wait(this.options.latencyMs);
    if (this.pendingFailure) {
      this.pendingFailure = false;
      throw new CommerceError('Could not reach the store (simulated network error).');
    }
  }

  async getCollection(handle: string): Promise<Collection> {
    await this.simulate();
    if (handle !== this.collection.handle) throw new CommerceError(`Collection "${handle}" not found`, false);
    return { ...this.collection, products: this.products };
  }

  async getProduct(handle: string): Promise<Product> {
    await this.simulate();
    const product = this.products.find((p) => p.handle === handle);
    if (!product) throw new CommerceError('This product is no longer available', false);
    return product;
  }

  async getVariants(ids: string[]): Promise<VariantSnapshot[]> {
    await wait(this.options.latencyMs / 2);
    const all = this.products.flatMap((p) => p.variants);
    return ids.flatMap((id) => {
      const v = all.find((x) => x.id === id);
      return v ? [{ variantId: v.id, available: v.available, quantityAvailable: v.quantityAvailable, price: v.price }] : [];
    });
  }

  async createCheckout(lines: CheckoutLine[]): Promise<Checkout> {
    await wait(this.options.latencyMs);
    if (!lines.length) throw new CommerceError('Your bag is empty', false);
    const cartId = `gid://shopify/Cart/sample-${Date.now()}`;
    return { cartId, checkoutUrl: `https://${this.options.storeId}.example.com/checkouts/sample`, isSample: true };
  }

  async isCheckoutCompleted(): Promise<boolean> {
    return false;
  }
}
