export type ThemeColors = {
  primary: string;
  onPrimary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  danger: string;
  success: string;
};

export type CommerceSource =
  | { provider: 'mock'; latencyMs: number }
  | { provider: 'shopify'; domain: string; storefrontToken: string; apiVersion: string };

export type ReviewsIntegration = {
  provider: 'judgeme';
  simulateOutage: boolean;
};

export type StoreConfig = {
  id: string;
  name: string;
  build: {
    appName: string;
    slug: string;
    bundleId: string;
    scheme: string;
    splashBackground: string;
  };
  branding: {
    logoText: string;
    tagline: string;
    colors: ThemeColors;
    radius: number;
    uppercaseHeadings: boolean;
    headingLetterSpacing: number;
  };
  locale: string;
  welcome: { slides: { title: string; body: string }[] };
  catalog: {
    homeCollection: string;
    heroTitle: string;
    heroSubtitle: string;
  };
  commerce: CommerceSource;
  features: {
    freeShippingThreshold: number | null;
  };
  integrations: {
    reviews: ReviewsIntegration | null;
  };
};
