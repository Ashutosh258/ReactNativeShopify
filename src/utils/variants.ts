import type { Product, Variant } from '@/data/types';

export type Selection = Record<string, string>;

export type OptionValueState = 'available' | 'soldOut' | 'unavailable';

const matches = (variant: Variant, selection: Selection) =>
  variant.selectedOptions.every((o) => selection[o.name] === undefined || selection[o.name] === o.value);

export function findVariant(product: Product, selection: Selection): Variant | null {
  if (product.options.some((o) => !selection[o.name])) return null;
  return product.variants.find((v) => matches(v, selection)) ?? null;
}

export function optionValueState(product: Product, selection: Selection, name: string, value: string): OptionValueState {
  const candidates = product.variants.filter((v) => matches(v, { ...selection, [name]: value }));
  if (!candidates.length) return 'unavailable';
  return candidates.some((v) => v.available) ? 'available' : 'soldOut';
}

export function initialSelection(product: Product): Selection {
  const variant = product.variants.find((v) => v.available) ?? product.variants[0];
  const selection: Selection = {};
  for (const option of product.options) {
    if (option.name === 'Size' && product.options.length > 1) continue;
    const value = variant?.selectedOptions.find((o) => o.name === option.name)?.value;
    if (value) selection[option.name] = value;
  }
  return selection;
}
