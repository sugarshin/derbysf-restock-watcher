export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string;
  inventory_quantity: number;
  available: boolean;
}

export interface ShopifyProduct {
  product: {
    id: number;
    title: string;
    handle: string;
    variants: ShopifyVariant[];
  };
}

export interface StockCheckResult {
  isInStock: boolean;
  quantity: number;
  method: "json" | "html";
  variantId: number;
  productTitle: string;
}

export interface PushoverPayload {
  token: string;
  user: string;
  message: string;
  title?: string;
  url?: string;
  url_title?: string;
  priority?: number;
  sound?: string;
}

export interface StockState {
  lastCheck: string;
  wasInStock: boolean;
  variantId: number;
}
