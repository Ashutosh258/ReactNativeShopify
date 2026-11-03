export type Money = { amount: number; currencyCode: string };

export type Image = { url: string; altText?: string | null };

export type SelectedOption = { name: string; value: string };

export type ProductOption = { name: string; values: string[] };

export type Variant = {
  id: string;
  title: string;
  available: boolean;
  quantityAvailable: number | null;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: SelectedOption[];
  image: Image | null;
  swatch: string | null;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  featuredImage: Image | null;
  options: ProductOption[];
  variants: Variant[];
  minPrice: Money;
  available: boolean;
};

export type Collection = {
  handle: string;
  title: string;
  products: Product[];
};

export type VariantSnapshot = {
  variantId: string;
  available: boolean;
  quantityAvailable: number | null;
  price: Money;
};

export type CheckoutLine = { variantId: string; quantity: number };

export type Checkout = { cartId: string; checkoutUrl: string; isSample: boolean };
