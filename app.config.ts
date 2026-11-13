/// <reference types="node" />
import fs from 'node:fs';
import path from 'node:path';
import type { ExpoConfig } from 'expo/config';
import type { StoreConfig } from './src/config/types';

const storesDir = path.join(__dirname, 'src/config/stores');
const storeId = process.env.STORE ?? 'athlx';
const storeFile = path.join(storesDir, `${storeId}.json`);
if (!fs.existsSync(storeFile)) {
  const known = fs.readdirSync(storesDir).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
  throw new Error(`Unknown STORE "${storeId}". Expected one of: ${known.join(', ')}`);
}
const store: StoreConfig = JSON.parse(fs.readFileSync(storeFile, 'utf8'));
const live = !!process.env.SHOPIFY_DOMAIN && (process.env.SHOPIFY_STORE_ID ?? 'athlx') === storeId;

const config: ExpoConfig = {
  name: store.build.appName,
  slug: store.build.slug,
  scheme: store.build.scheme,
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: store.build.bundleId,
    supportsTablet: false,
  },
  android: {
    package: store.build.bundleId,
    adaptiveIcon: {
      backgroundColor: store.build.splashBackground,
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: { favicon: './assets/favicon.png' },
  plugins: [
    'expo-router',
    'expo-status-bar',
    'expo-image',
    'expo-web-browser',
    ['expo-splash-screen', { image: './assets/splash-icon.png', imageWidth: 200, backgroundColor: store.build.splashBackground }],
  ],
  experiments: { typedRoutes: true },
  extra: {
    storeId,
    shopify: live
      ? {
          domain: process.env.SHOPIFY_DOMAIN,
          storefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN ?? '',
          apiVersion: process.env.SHOPIFY_API_VERSION ?? '2026-10',
        }
      : null,
  },
};

export default config;
