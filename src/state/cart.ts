import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { store } from '@/config';
import type { Money, Product, Variant, VariantSnapshot } from '@/data/types';

export type CartLine = {
  variantId: string;
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  swatch: string | null;
  imageUrl: string | null;
  price: Money;
  quantity: number;
  maxQuantity: number | null;
  available: boolean;
};

type CartState = {
  lines: CartLine[];
  add: (product: Product, variant: Variant, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  reconcile: (snapshots: VariantSnapshot[]) => void;
};

const clamp = (qty: number, max: number | null) => Math.max(1, max == null ? qty : Math.min(qty, max));

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (product, variant, quantity = 1) =>
        set(({ lines }) => {
          const existing = lines.find((l) => l.variantId === variant.id);
          if (existing) {
            return {
              lines: lines.map((l) =>
                l.variantId === variant.id ? { ...l, quantity: clamp(l.quantity + quantity, l.maxQuantity) } : l,
              ),
            };
          }
          const line: CartLine = {
            variantId: variant.id,
            productHandle: product.handle,
            productTitle: product.title,
            variantTitle: variant.title,
            swatch: variant.swatch,
            imageUrl: variant.image?.url ?? product.featuredImage?.url ?? null,
            price: variant.price,
            quantity: clamp(quantity, variant.quantityAvailable),
            maxQuantity: variant.quantityAvailable,
            available: variant.available,
          };
          return { lines: [...lines, line] };
        }),
      setQuantity: (variantId, quantity) =>
        set(({ lines }) => ({
          lines: lines.map((l) => (l.variantId === variantId ? { ...l, quantity: clamp(quantity, l.maxQuantity) } : l)),
        })),
      remove: (variantId) => set(({ lines }) => ({ lines: lines.filter((l) => l.variantId !== variantId) })),
      clear: () => set({ lines: [] }),
      reconcile: (snapshots) =>
        set(({ lines }) => ({
          lines: lines.map((l) => {
            const s = snapshots.find((x) => x.variantId === l.variantId);
            if (!s) return { ...l, available: false };
            return {
              ...l,
              price: s.price,
              available: s.available,
              maxQuantity: s.quantityAvailable,
              quantity: clamp(l.quantity, s.quantityAvailable),
            };
          }),
        })),
    }),
    {
      name: `cart:${store.id}`,
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ lines }) => ({ lines }),
    },
  ),
);

export const selectCount = (s: CartState) => s.lines.reduce((n, l) => n + l.quantity, 0);

export function subtotalOf(lines: CartLine[]): Money | null {
  const purchasable = lines.filter((l) => l.available);
  if (!purchasable.length) return null;
  return {
    amount: purchasable.reduce((sum, l) => sum + l.price.amount * l.quantity, 0),
    currencyCode: purchasable[0].price.currencyCode,
  };
}

export function useSubtotal() {
  const lines = useCart((s) => s.lines);
  return useMemo(() => subtotalOf(lines), [lines]);
}
