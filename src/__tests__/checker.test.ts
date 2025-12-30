import { describe, it, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert";

describe("checkStock", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should return in-stock when inventory_quantity > 0", async () => {
    globalThis.fetch = mock.fn(async () => ({
      ok: true,
      json: async () => ({
        product: {
          id: 123,
          title: "Classical Derby Black",
          handle: "classical-derby-black",
          variants: [
            {
              id: 924781853,
              title: "L",
              inventory_quantity: 5,
              available: true,
            },
          ],
        },
      }),
    })) as typeof fetch;

    const { checkStock } = await import("../checker.ts");
    const result = await checkStock();

    assert.strictEqual(result.isInStock, true);
    assert.strictEqual(result.quantity, 5);
    assert.strictEqual(result.method, "json");
    assert.strictEqual(result.variantId, 924781853);
  });

  it("should return out-of-stock when inventory_quantity <= 0", async () => {
    globalThis.fetch = mock.fn(async () => ({
      ok: true,
      json: async () => ({
        product: {
          id: 123,
          title: "Classical Derby Black",
          handle: "classical-derby-black",
          variants: [
            {
              id: 924781853,
              title: "L",
              inventory_quantity: -1,
              available: false,
            },
          ],
        },
      }),
    })) as typeof fetch;

    const { checkStock } = await import("../checker.ts");
    const result = await checkStock();

    assert.strictEqual(result.isInStock, false);
    assert.strictEqual(result.quantity, -1);
    assert.strictEqual(result.method, "json");
  });

  it("should fallback to HTML when JSON returns 403", async () => {
    let callCount = 0;
    globalThis.fetch = mock.fn(async (url: string | URL | Request) => {
      callCount++;
      const urlStr = url.toString();
      if (urlStr.endsWith(".json")) {
        return { ok: false, status: 403 };
      }
      return {
        ok: true,
        text: async () =>
          `<html>"id":924781853,"inventory_quantity":3,"available":true</html>`,
      };
    }) as typeof fetch;

    const { checkStock } = await import("../checker.ts");
    const result = await checkStock();

    assert.strictEqual(result.isInStock, true);
    assert.strictEqual(result.quantity, 3);
    assert.strictEqual(result.method, "html");
    assert.strictEqual(callCount, 2);
  });

  it("should detect sold out from HTML when no inventory data", async () => {
    globalThis.fetch = mock.fn(async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.endsWith(".json")) {
        return { ok: false, status: 403 };
      }
      return {
        ok: true,
        text: async () => `<html>sold out</html>`,
      };
    }) as typeof fetch;

    const { checkStock } = await import("../checker.ts");
    const result = await checkStock();

    assert.strictEqual(result.isInStock, false);
    assert.strictEqual(result.method, "html");
  });
});
