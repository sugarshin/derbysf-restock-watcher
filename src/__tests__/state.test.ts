import { describe, it } from "node:test";
import assert from "node:assert";
import { shouldNotify } from "../state.ts";
import type { StockState } from "../types.ts";

describe("shouldNotify", () => {
  it("should return true when no previous state and now in stock", () => {
    const result = shouldNotify(null, true);
    assert.strictEqual(result, true);
  });

  it("should return false when no previous state and now out of stock", () => {
    const result = shouldNotify(null, false);
    assert.strictEqual(result, false);
  });

  it("should return true when was out of stock and now in stock", () => {
    const previousState: StockState = {
      lastCheck: "2024-01-01T00:00:00Z",
      wasInStock: false,
      variantId: 924781853,
    };
    const result = shouldNotify(previousState, true);
    assert.strictEqual(result, true);
  });

  it("should return false when was in stock and still in stock", () => {
    const previousState: StockState = {
      lastCheck: "2024-01-01T00:00:00Z",
      wasInStock: true,
      variantId: 924781853,
    };
    const result = shouldNotify(previousState, true);
    assert.strictEqual(result, false);
  });

  it("should return false when was in stock and now out of stock", () => {
    const previousState: StockState = {
      lastCheck: "2024-01-01T00:00:00Z",
      wasInStock: true,
      variantId: 924781853,
    };
    const result = shouldNotify(previousState, false);
    assert.strictEqual(result, false);
  });

  it("should return false when was out of stock and still out of stock", () => {
    const previousState: StockState = {
      lastCheck: "2024-01-01T00:00:00Z",
      wasInStock: false,
      variantId: 924781853,
    };
    const result = shouldNotify(previousState, false);
    assert.strictEqual(result, false);
  });
});
