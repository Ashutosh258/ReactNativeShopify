import type { CommerceClient } from '../CommerceClient';
import { CommerceError } from '../CommerceClient';
import type { Checkout, CheckoutLine, Collection, Money, Product, Variant, VariantSnapshot } from '../../types';
import {
  CART_CREATE,
  COLLECTION_PRODUCTS,
  PRODUCT_BY_HANDLE,
  VARIANT_SNAPSHOTS,
} from './operations';

type ShopifyMoney = { amount: string; currencyCode: string };

type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: { name: string; value: string }[];
  image: { url: string; altText: string | null } | null;
};

type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: { url: string; altText: string | null } | null;
  options: { name: string; optionValues: { name: string; swatch: { color: string | null } | null }[] }[];
  priceRange: { minVariantPrice: ShopifyMoney };
  variants: { nodes: ShopifyVariant[] };
};

type Config = { domain: string; storefrontToken: string; apiVersion: string };

const toMoney = (m: ShopifyMoney): Money => ({ amount: Number(m.amount), currencyCode: m.currencyCode });

function toProduct(p: ShopifyProduct): Product {
  const swatches = new Map<string, string>();
  for (const option of p.options) {
    for (const v of option.optionValues) if (v.swatch?.color) swatches.set(v.name, v.swatch.color);
  }
  const variants: Variant[] = p.variants.nodes.map((v) => ({
    id: v.id,
    title: v.title,
    available: v.availableForSale,
    quantityAvailable: v.quantityAvailable,
    price: toMoney(v.price),
    compareAtPrice: v.compareAtPrice ? toMoney(v.compareAtPrice) : null,
    selectedOptions: v.selectedOptions,
    image: v.image,
    swatch: v.selectedOptions.map((o) => swatches.get(o.value)).find(Boolean) ?? null,
  }));
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    productType: p.productType,
    tags: p.tags,
    featuredImage: p.featuredImage,
    options: p.options.map((o) => ({ name: o.name, values: o.optionValues.map((v) => v.name) })),
    variants,
    minPrice: toMoney(p.priceRange.minVariantPrice),
    available: p.availableForSale,
  };
}

export class ShopifyClient implements CommerceClient {
  readonly isSampleData = false;

  constructor(private readonly config: Config) {}

  private async request<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const { domain, apiVersion, storefrontToken } = this.config;
    let res: Response;
    try {
      res = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': storefrontToken,
        },
        body: JSON.stringify({ query, variables }),
      });
    } catch {
      throw new CommerceError('Network unavailable. Check your connection.');
    }
    if (!res.ok) throw new CommerceError(`Store responded with ${res.status}`, res.status >= 500 || res.status === 429);
    const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
    if (json.errors?.length) throw new CommerceError(json.errors[0].message, false);
    return json.data as T;
  }

  async getCollection(handle: string): Promise<Collection> {
    const data = await this.request<{
      collection: { handle: string; title: string; products: { nodes: ShopifyProduct[] } } | null;
    }>(COLLECTION_PRODUCTS, { handle, first: 24 });
    if (!data.collection) throw new CommerceError(`Collection "${handle}" not found`, false);
    return {
      handle: data.collection.handle,
      title: data.collection.title,
      products: data.collection.products.nodes.map(toProduct),
    };
  }

  async getProduct(handle: string): Promise<Product> {
    const data = await this.request<{ product: ShopifyProduct | null }>(PRODUCT_BY_HANDLE, { handle });
    if (!data.product) throw new CommerceError('This product is no longer available', false);
    return toProduct(data.product);
  }

  async getVariants(ids: string[]): Promise<VariantSnapshot[]> {
    if (!ids.length) return [];
    const data = await this.request<{
      nodes: (Pick<ShopifyVariant, 'id' | 'availableForSale' | 'quantityAvailable' | 'price'> | null)[];
    }>(VARIANT_SNAPSHOTS, { ids });
    return data.nodes
      .filter((n): n is NonNullable<typeof n> => !!n)
      .map((n) => ({
        variantId: n.id,
        available: n.availableForSale,
        quantityAvailable: n.quantityAvailable,
        price: toMoney(n.price),
      }));
  }

  async createCheckout(lines: CheckoutLine[]): Promise<Checkout> {
    const data = await this.request<{
      cartCreate: { cart: { id: string; checkoutUrl: string } | null; userErrors: { message: string }[] };
    }>(CART_CREATE, {
      input: { lines: lines.map((l) => ({ merchandiseId: l.variantId, quantity: l.quantity })) },
    });
    const { cart, userErrors } = data.cartCreate;
    if (!cart) throw new CommerceError(userErrors[0]?.message ?? 'Could not start checkout', false);
    return { cartId: cart.id, checkoutUrl: cart.checkoutUrl, isSample: false };
  }
}
