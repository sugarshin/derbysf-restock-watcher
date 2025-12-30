import type { ShopifyProduct, StockCheckResult } from "./types.ts";
import { config } from "./config.ts";

export async function checkStock(): Promise<StockCheckResult> {
  try {
    const result = await checkViaJson();
    if (result !== null) {
      return result;
    }
  } catch (error) {
    console.log("JSON API failed, trying HTML fallback...", error);
  }

  return await checkViaHtml();
}

async function checkViaJson(): Promise<StockCheckResult | null> {
  const response = await fetch(config.productJsonUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; StockChecker/1.0)",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      return null;
    }
    throw new Error(`HTTP ${response.status}`);
  }

  const data: ShopifyProduct = await response.json();
  const variant = data.product.variants.find(
    (v) => v.id === config.targetVariantId
  );

  if (!variant) {
    throw new Error(`Variant ${config.targetVariantId} not found`);
  }

  return {
    isInStock: variant.inventory_quantity > 0,
    quantity: variant.inventory_quantity,
    method: "json",
    variantId: variant.id,
    productTitle: `${data.product.title} - ${variant.title}`,
  };
}

async function checkViaHtml(): Promise<StockCheckResult> {
  const response = await fetch(config.productUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "text/html",
      "Accept-Language": "ja,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`HTML fetch failed: HTTP ${response.status}`);
  }

  const html = await response.text();

  const inventoryMatch = html.match(
    new RegExp(
      `"id":${config.targetVariantId}[^}]*"inventory_quantity":([\\-\\d]+)`
    )
  );

  if (inventoryMatch) {
    const quantity = parseInt(inventoryMatch[1], 10);
    return {
      isInStock: quantity > 0,
      quantity,
      method: "html",
      variantId: config.targetVariantId,
      productTitle: "Classical Derby Black - L",
    };
  }

  const availableMatch = html.match(
    new RegExp(`"id":${config.targetVariantId}[^}]*"available":(true|false)`)
  );

  if (availableMatch) {
    const isInStock = availableMatch[1] === "true";
    return {
      isInStock,
      quantity: isInStock ? 1 : 0,
      method: "html",
      variantId: config.targetVariantId,
      productTitle: "Classical Derby Black - L",
    };
  }

  const isSoldOut = /sold\s*out|品切れ|在庫切れ/i.test(html);

  return {
    isInStock: !isSoldOut,
    quantity: isSoldOut ? 0 : -1,
    method: "html",
    variantId: config.targetVariantId,
    productTitle: "Classical Derby Black - L",
  };
}
