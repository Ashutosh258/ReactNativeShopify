import { store } from '@/config';
import type { Money } from '@/data/types';

const formatters = new Map<string, Intl.NumberFormat>();

export function formatMoney({ amount, currencyCode }: Money) {
  let f = formatters.get(currencyCode);
  if (!f) {
    f = new Intl.NumberFormat(store.locale, { style: 'currency', currency: currencyCode });
    formatters.set(currencyCode, f);
  }
  return f.format(amount);
}
