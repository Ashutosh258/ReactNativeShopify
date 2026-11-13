# Connecting a Shopify development store

This guide connects the ATHLX app to a real Shopify development store and then demonstrates two flows:

1. Change a variant's stock in Shopify Admin and see it in the app.
2. Place a test order from the app and see the order and the reduced stock in Shopify Admin.

The app talks to Shopify only through the **Storefront API**, using a public token. The **Admin API** is used only by `scripts/shopify-admin.mjs`, which runs on your machine to load the sample catalogue and print stock and orders. Admin credentials are never bundled into the app.

## 1. Create the store (Shopify side, about 10 minutes)

| Step | Where | What to do |
|---|---|---|
| Dev store | [Dev Dashboard](https://dev.shopify.com/dashboard) → **Dev stores** → **Create dev store**. The [Partner Dashboard](https://partners.shopify.com) → **Stores** → **Add store** → **Development store** also works | Name it anything. Leave test data off |
| Currency | Admin → **Settings → General → Store defaults** | Set it to **USD**, because the ATHLX catalogue is priced in USD |
| Test payments | Admin → **Settings → Payments** | Activate **(for testing) Bogus Gateway**. Shopify Payments in test mode works too |
| Storefront token | Install the [Headless channel](https://apps.shopify.com/headless) → **Create storefront** → **Storefront API** | Copy the **public access token**. Under **Permissions**, also turn on **product inventory** (`unauthenticated_read_product_inventory`) so the app can show "Only N left" |
| Admin access for the seed script | Dev Dashboard → **Apps** → **Create app** → **Versions** → **Create version** | Put `write_products,write_inventory,read_locations,write_publications,read_orders` under **Scopes** (not optional scopes) and **Release**. Install or approve it at `https://admin.shopify.com/store/<store>/oauth/install?client_id=<client id>`. Then copy the **Client ID** and **Client secret** from **Settings** |

If your store still offers legacy custom apps (**Settings → Apps → Develop apps**), you can use an Admin API access token with the same scopes as `SHOPIFY_ADMIN_TOKEN` instead of the client ID and secret.

## 2. Configure the project

```bash
cp -n .env.example .env.local
```

`-n` stops the copy from overwriting an existing `.env.local`. Overwriting it wipes your tokens.

Fill in `SHOPIFY_DOMAIN` (`your-store.myshopify.com`), `SHOPIFY_STOREFRONT_TOKEN`, and either the client ID and secret or `SHOPIFY_ADMIN_TOKEN`. `.env.local` is gitignored.

`SHOPIFY_STORE_ID=athlx` limits the live store to the ATHLX config, so `verde` stays on sample data. To run ATHLX on sample data again, set it to `none`.

## 3. Load the catalogue into Shopify

```bash
npm run shopify -- seed
```

This creates or updates the same 6 ATHLX products the sample data uses:

- Variants, prices, a compare-at price and per-colour images.
- Stock levels at your default location: sold-out variants at 0, Black / M leggings at 2, everything else at 10.
- The **New Releases** (`new-releases`) collection.

Everything is published to all sales channels, including Headless. It's safe to re-run, but re-running resets stock to the starting values.

```bash
npm run shopify -- stock
```

```bash
npm run shopify -- orders
```

## 4. Run the app against the store

```bash
npm run store:athlx
```

Press `a` for Android or `w` for web. The "Sample data" banner disappears, and products, images, prices and stock now come from Shopify.

Restart with `--clear` (the `store:*` scripts already do this) whenever you edit `.env.local`, because `app.config.ts` reads it at start-up.

## 5. Demo: stock changes in Admin show up in the app

1. In the app, open **Vital Seamless Leggings** → **Black / M**. It shows **Only 2 left**.
2. In Admin → **Products → Vital Seamless Leggings** → variant **Black / M** → **Inventory**, set **Available** to `0` and save.
3. In the app, pull down on the product page, or go back and reopen it. **M** is now struck through and the button reads **Sold out**.
4. Set it to `5` in Admin and refresh again. The low-stock warning is gone and **Add to bag** is back.

How the app picks up changes: the product and home screens refetch whenever they regain focus and on pull-to-refresh. The bag re-checks every line (price, availability and maximum quantity) each time it opens and again before checkout.

## 6. Demo: place a test order from the app

1. Note the stock of **Black / L** (`npm run shopify -- stock` shows 10).
2. In the app, add **Vital Seamless Leggings – Black / L** to the bag, open the bag, and tap **Checkout**.
3. Shopify checkout opens in the browser. Enter any email and address. For Bogus Gateway use card number `1`, any name, a future expiry date and any CVV, then tap **Pay now**.
4. Close the browser. The app sees that the cart has become an order (Shopify returns `null` for a completed cart), clears the bag and shows **Order placed**.
5. In Admin → **Orders**, the newest order lists the leggings with the sales channel **Headless**. **Products → Vital Seamless Leggings → Black / L** now shows **9**. You can also check from the terminal:

```bash
npm run shopify -- orders
```

```bash
npm run shopify -- stock
```

**Dev store password.** Development stores are always password-protected, and `checkoutUrl` redirects to `/password` until the browser has entered it. The first time, the checkout browser shows the password page:

1. Enter the store password (Admin → **Online Store → Preferences**).
2. Close the browser, and tap **Checkout** again.

The browser keeps the password cookie, so later checkouts go straight to Shopify checkout. This only applies to dev stores; live stores have no password.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Collection "new-releases" not found` | Run `seed` again. The collection must be published to the Headless channel |
| No "Only N left" message, and the cart has no quantity cap | The Storefront token is missing the product inventory permission |
| `Online Store channel is locked` | The Storefront token wasn't sent. `SHOPIFY_STOREFRONT_TOKEN` is empty |
| `Store responded with 401/403` | Wrong `SHOPIFY_STOREFRONT_TOKEN`, or a token from a different store |
| Seed fails with `app_not_installed` | The app isn't installed on this store. Open the install link above |
| Seed fails with `Access denied for locations field` | The installed version has no scopes. Release a version with the scopes, then approve it again through the install link |
| Prices show in the wrong currency | Change the store currency to USD before seeding |
