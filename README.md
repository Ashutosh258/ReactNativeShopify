# Shopify Store → Mobile App (React Native prototype)

One shared Expo / React Native codebase that turns a store config into a branded Android and iOS shopping app. The visual reference is gymshark.com.

- **Architecture, integration plan, risks and tooling:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Stores included:** `athlx` (Gymshark-style, USD, free-shipping bar on, reviews working) and `verde` (Verde Yoga Co., GBP, free-shipping bar off, reviews provider outage)
- **Data:** labelled sample data by default. The real Storefront API client and GraphQL operations are included and switch on with env vars.

## Setup

Requires Node 20+ (tested with Node 22).

```bash
npm install
```

Run the default store (ATHLX):

```bash
npx expo start
```

Then press `a` for the Android emulator, `i` for the iOS simulator (macOS only), `w` for web, or scan the QR code with **Expo Go (SDK 58)** on a device.

Run the second store. Only the config changes, not the screens:

```bash
npm run store:verde
```

Simulate a network failure on the first request of each session, to see the error and retry states:

```bash
node scripts/store.mjs athlx --simulate-errors
```

Connect a real Shopify development store (Storefront API, public token):

```bash
SHOPIFY_DOMAIN=your-store.myshopify.com SHOPIFY_STOREFRONT_TOKEN=xxxx STORE=athlx npx expo start --clear
```

The store's collection handle must match `catalog.homeCollection` in the store config. `quantityAvailable` needs the `unauthenticated_read_product_inventory` scope.

Other checks:

```bash
npm run typecheck
```

```bash
npx expo lint
```

```bash
npx expo-doctor
```

To build a store-specific binary: `STORE=verde npx eas-cli@latest build --profile production` (requires an EAS account). This isn't part of the prototype submission.

## Adding a new store

1. Copy `src/config/stores/athlx.json` to `src/config/stores/<id>.json` and edit the branding, copy, catalog, features and integrations.
2. Register it in `src/config/stores/index.ts`.
3. For sample mode, add fixtures in `src/data/commerce/mock/fixtures.ts`. For a live store, set the `SHOPIFY_*` env vars.
4. Start it with `node scripts/store.mjs <id>`.

## Walkthrough script (3 min)

1. **ATHLX:** welcome → Skip → home grid (Sale / Bestseller / Sold out badges, free-shipping bar).
2. **Vital Seamless Leggings:** Black / XL is struck through (sold out). Black / M shows "Only 2 left". Add it twice, and the CTA changes to "Max quantity in bag". Reviews load (mocked Judge.me).
3. **Arrival Shorts:** Navy / XS is a disabled, non-existent combination.
4. **Bag:** change quantity, watch the free-shipping progress, remove an item, check out → sample checkout screen → "Simulate order placed" → empty bag state.
5. Add an item, kill the app and reopen it: the bag is restored and the welcome screen is skipped.
6. `npm run store:verde`: new name, colors, rounded UI, GBP, no free-shipping bar. On a product page, **Reviews are unavailable**, but shopping still works.
7. `--simulate-errors`: error screen → Try again.

## Platforms tested

| Platform | Status |
|---|---|
| Android emulator (Pixel 9 Pro XL, Expo Go 58) | ✅ Welcome, home, product, add to bag, cart persistence after force-stop and relaunch |
| Web (react-native-web, 375×812 mobile viewport) | ✅ Full journey for both stores, error/retry, reviews success and outage, sample checkout |
| iOS | ⚠️ Not tested: no macOS/Xcode available. The code uses only cross-platform Expo modules. Run with `npx expo start` → `i`, or Expo Go on an iPhone |

## Project notes

- **AI tools:** Claude Code (Claude Opus) for implementation, testing in the browser and Android emulator, and docs.
- **Issue corrected:** an unstable Zustand selector (`selectSubtotal` returned a new object each render) crashed add-to-cart with "Maximum update depth exceeded". It was replaced with a memoized `useSubtotal()`. See ARCHITECTURE.md §13 for the others.
- **Unfinished:** live Shopify store not connected, Checkout Kit (needs a dev build), customer login, server-synced cart, real imagery, automated tests.
