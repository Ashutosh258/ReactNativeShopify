import { useEffect, useState } from 'react';
import { useAppState } from '@/state/app';
import { useCart } from '@/state/cart';

const stores = [useCart, useAppState];

export function useHydrated() {
  const [hydrated, setHydrated] = useState(() => stores.every((s) => s.persist.hasHydrated()));

  useEffect(() => {
    if (hydrated) return;
    const check = () => stores.every((s) => s.persist.hasHydrated()) && setHydrated(true);
    const unsubs = stores.map((s) => s.persist.onFinishHydration(check));
    check();
    return () => unsubs.forEach((u) => u());
  }, [hydrated]);

  return hydrated;
}
