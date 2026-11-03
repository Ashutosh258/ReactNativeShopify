import type { Money, Product, Variant } from '../../types';

export type ProductSpec = {
  handle: string;
  title: string;
  productType: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  colors: [name: string, hex: string][];
  sizes: string[];
  soldOut?: string[];
  missing?: string[];
  lowStock?: Record<string, number>;
  tags?: string[];
};

const DEFAULT_STOCK = 10;

export function buildProduct(spec: ProductSpec, currencyCode: string): Product {
  const money = (amount: number): Money => ({ amount, currencyCode });
  const hasSize = spec.sizes.length > 0;
  const variants: Variant[] = [];

  for (const [color, hex] of spec.colors) {
    for (const size of hasSize ? spec.sizes : [null]) {
      const title = size ? `${color} / ${size}` : color;
      if (spec.missing?.includes(title)) continue;
      const soldOut = spec.soldOut?.includes(title) || spec.soldOut?.includes(color);
      variants.push({
        id: `gid://shopify/ProductVariant/sample-${spec.handle}-${title.replace(/\W+/g, '-').toLowerCase()}`,
        title,
        available: !soldOut,
        quantityAvailable: soldOut ? 0 : (spec.lowStock?.[title] ?? DEFAULT_STOCK),
        price: money(spec.price),
        compareAtPrice: spec.compareAtPrice ? money(spec.compareAtPrice) : null,
        selectedOptions: size
          ? [{ name: 'Colour', value: color }, { name: 'Size', value: size }]
          : [{ name: 'Colour', value: color }],
        image: null,
        swatch: hex,
      });
    }
  }

  const options = [{ name: 'Colour', values: spec.colors.map(([c]) => c) }];
  if (hasSize) options.push({ name: 'Size', values: spec.sizes });

  return {
    id: `gid://shopify/Product/sample-${spec.handle}`,
    handle: spec.handle,
    title: spec.title,
    description: spec.description,
    productType: spec.productType,
    tags: spec.tags ?? [],
    featuredImage: null,
    options,
    variants,
    minPrice: money(spec.price),
    available: variants.some((v) => v.available),
  };
}
