import fs from 'node:fs';
import { fixtures } from '../src/data/commerce/mock/fixtures.ts';

if (fs.existsSync('.env.local')) process.loadEnvFile('.env.local');

const { SHOPIFY_DOMAIN, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET, SHOPIFY_ADMIN_TOKEN } = process.env;
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? '2026-10';
const storeId = process.env.SHOPIFY_STORE_ID ?? 'athlx';
const [command = 'help'] = process.argv.slice(2);

if (!SHOPIFY_DOMAIN) fail('Set SHOPIFY_DOMAIN in .env.local (see .env.example).');

function fail(message) {
  console.error(message);
  process.exit(1);
}

async function adminToken() {
  if (SHOPIFY_ADMIN_TOKEN) return SHOPIFY_ADMIN_TOKEN;
  if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) fail('Set SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET (or SHOPIFY_ADMIN_TOKEN).');
  const res = await fetch(`https://${SHOPIFY_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: SHOPIFY_CLIENT_ID, client_secret: SHOPIFY_CLIENT_SECRET }),
  });
  if (!res.ok) {
    const body = await res.text();
    fail(`Token request failed (${res.status}): ${body.match(/<title>(.*?)<\/title>/)?.[1] ?? body.slice(0, 300)}`);
  }
  return (await res.json()).access_token;
}

const token = await adminToken();

async function gql(query, variables = {}) {
  const res = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) fail(`Admin API error: ${JSON.stringify(json.errors ?? json)}`);
  return json.data;
}

function userErrors(label, errors) {
  if (errors?.length) console.warn(`  ${label}: ${errors.map((e) => e.message).join('; ')}`);
  return !errors?.length;
}

function imageUrl(hex, text) {
  const n = parseInt(hex.slice(1), 16);
  const light = ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 150;
  return `https://placehold.co/800x1000/${hex.slice(1)}/${light ? '111111' : 'FFFFFF'}.png?text=${encodeURIComponent(text)}`;
}

const slug = (s) => s.replace(/\W+/g, '-').toLowerCase();

function productInput(spec, locationId, vendor) {
  const files = new Map(
    spec.colors.map(([color, hex]) => [
      color,
      { originalSource: imageUrl(hex, `${spec.title}\n${color}`), contentType: 'IMAGE', alt: `${spec.title} – ${color}`, filename: `${spec.handle}-${slug(color)}.png` },
    ]),
  );
  const variants = [];
  for (const [color] of spec.colors) {
    for (const size of spec.sizes.length ? spec.sizes : [null]) {
      const title = size ? `${color} / ${size}` : color;
      if (spec.missing?.includes(title)) continue;
      const soldOut = spec.soldOut?.includes(title) || spec.soldOut?.includes(color);
      variants.push({
        optionValues: [{ optionName: 'Colour', name: color }, ...(size ? [{ optionName: 'Size', name: size }] : [])],
        price: spec.price,
        compareAtPrice: spec.compareAtPrice ?? null,
        inventoryPolicy: 'DENY',
        inventoryItem: { tracked: true },
        inventoryQuantities: [{ locationId, name: 'available', quantity: soldOut ? 0 : (spec.lowStock?.[title] ?? 10) }],
        file: files.get(color),
      });
    }
  }
  const productOptions = [{ name: 'Colour', position: 1, values: spec.colors.map(([name]) => ({ name })) }];
  if (spec.sizes.length) productOptions.push({ name: 'Size', position: 2, values: spec.sizes.map((name) => ({ name })) });
  return {
    title: spec.title,
    handle: spec.handle,
    productType: spec.productType,
    descriptionHtml: `<p>${spec.description}</p>`,
    tags: spec.tags ?? [],
    vendor,
    status: 'ACTIVE',
    productOptions,
    files: [...files.values()],
    variants,
  };
}

async function seed() {
  const fixture = fixtures[storeId];
  if (!fixture) fail(`No fixtures for "${storeId}".`);
  const { shop, locations, publications } = await gql(`{
    shop { name currencyCode }
    locations(first: 1) { nodes { id name } }
    publications(first: 20) { nodes { id } }
  }`);
  const locationId = locations.nodes[0]?.id;
  if (!locationId) fail('No inventory location found.');
  if (shop.currencyCode !== fixture.currencyCode) {
    console.warn(`Store currency is ${shop.currencyCode}; fixtures are priced in ${fixture.currencyCode}. Amounts are used as-is.`);
  }
  const publicationInput = publications.nodes.map((p) => ({ publicationId: p.id }));
  console.log(`Seeding ${fixture.products.length} products into ${shop.name} (${locations.nodes[0].name}, ${publicationInput.length} sales channels)`);

  const productIds = [];
  for (const spec of fixture.products) {
    const { productSet } = await gql(
      `mutation Seed($input: ProductSetInput!, $identifier: ProductSetIdentifiers) {
        productSet(synchronous: true, input: $input, identifier: $identifier) {
          product { id variants(first: 100) { nodes { id } } }
          userErrors { field message }
        }
      }`,
      { input: productInput(spec, locationId, shop.name), identifier: { handle: spec.handle } },
    );
    if (!userErrors(spec.handle, productSet.userErrors) || !productSet.product) continue;
    const { id, variants } = productSet.product;
    productIds.push(id);
    const { publishablePublish } = await gql(
      `mutation Publish($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { message } } }`,
      { id, input: publicationInput },
    );
    userErrors(`${spec.handle} publish`, publishablePublish.userErrors);
    console.log(`  ✓ ${spec.title} (${variants.nodes.length} variants)`);
  }

  const { handle, title } = fixture.collection;
  const { collections } = await gql(`query ($q: String!) { collections(first: 1, query: $q) { nodes { id } } }`, { q: `handle:${handle}` });
  let collectionId = collections.nodes[0]?.id;
  if (!collectionId) {
    const { collectionCreate } = await gql(
      `mutation ($input: CollectionInput!) { collectionCreate(input: $input) { collection { id } userErrors { message } } }`,
      { input: { title, handle } },
    );
    userErrors('collection', collectionCreate.userErrors);
    collectionId = collectionCreate.collection?.id;
  }
  if (!collectionId) fail('Could not create the collection.');
  const { collectionAddProducts } = await gql(
    `mutation ($id: ID!, $productIds: [ID!]!) { collectionAddProducts(id: $id, productIds: $productIds) { userErrors { message } } }`,
    { id: collectionId, productIds },
  );
  userErrors('collection products', collectionAddProducts.userErrors);
  const { publishablePublish } = await gql(
    `mutation ($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { message } } }`,
    { id: collectionId, input: publicationInput },
  );
  userErrors('collection publish', publishablePublish.userErrors);
  console.log(`  ✓ Collection "${title}" (${handle})`);
}

async function stock() {
  const handles = fixtures[storeId].products.map((p) => `handle:${p.handle}`).join(' OR ');
  const { products } = await gql(
    `query ($q: String!) { products(first: 50, query: $q) { nodes { title variants(first: 100) { nodes { title inventoryQuantity } } } } }`,
    { q: handles },
  );
  for (const p of products.nodes) {
    console.log(p.title);
    for (const v of p.variants.nodes) console.log(`  ${v.title.padEnd(22)} ${v.inventoryQuantity}`);
  }
}

async function orders() {
  const { orders } = await gql(`{
    orders(first: 5, sortKey: CREATED_AT, reverse: true) {
      nodes {
        name createdAt test sourceName displayFinancialStatus
        totalPriceSet { shopMoney { amount currencyCode } }
        lineItems(first: 20) { nodes { title variantTitle quantity } }
      }
    }
  }`);
  if (!orders.nodes.length) console.log('No orders yet.');
  for (const o of orders.nodes) {
    const total = o.totalPriceSet.shopMoney;
    console.log(`${o.name}  ${o.createdAt}  ${total.amount} ${total.currencyCode}  ${o.displayFinancialStatus}  source=${o.sourceName}${o.test ? '  (test)' : ''}`);
    for (const li of o.lineItems.nodes) console.log(`  ${li.quantity} × ${li.title} — ${li.variantTitle ?? ''}`);
  }
}

const commands = { seed, stock, orders };
if (!commands[command]) fail('Usage: npm run shopify -- <seed|stock|orders>');
await commands[command]();
