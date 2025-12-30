import { describe, it, mock, afterEach } from "node:test";
import assert from "node:assert";
import type { StockCheckResult } from "../types.ts";

describe("sendRestockNotification", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should send notification to Pushover API", async () => {
    let capturedBody: string | undefined;

    globalThis.fetch = mock.fn(async (_url, options) => {
      capturedBody = options?.body as string;
      return { ok: true };
    }) as typeof fetch;

    const { sendRestockNotification } = await import("../notifier.ts");

    const result: StockCheckResult = {
      isInStock: true,
      quantity: 5,
      method: "json",
      variantId: 924781853,
      productTitle: "Classical Derby Black - L",
    };

    await sendRestockNotification(result);

    assert.ok(capturedBody);
    const body = JSON.parse(capturedBody);
    assert.strictEqual(body.token, "test");
    assert.strictEqual(body.user, "test");
    assert.ok(body.message.includes("Classical Derby Black - L"));
    assert.ok(body.message.includes("5"));
    assert.strictEqual(body.priority, 1);
  });

  it("should throw error when Pushover API fails", async () => {
    globalThis.fetch = mock.fn(async () => ({
      ok: false,
      status: 400,
      text: async () => "Invalid token",
    })) as typeof fetch;

    const { sendRestockNotification } = await import("../notifier.ts");

    const result: StockCheckResult = {
      isInStock: true,
      quantity: 5,
      method: "json",
      variantId: 924781853,
      productTitle: "Classical Derby Black - L",
    };

    await assert.rejects(async () => {
      await sendRestockNotification(result);
    }, /Pushover API error: 400/);
  });
});

describe("sendErrorNotification", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should send error notification with low priority", async () => {
    let capturedBody: string | undefined;

    globalThis.fetch = mock.fn(async (_url, options) => {
      capturedBody = options?.body as string;
      return { ok: true };
    }) as typeof fetch;

    const { sendErrorNotification } = await import("../notifier.ts");

    await sendErrorNotification(new Error("Test error message"));

    assert.ok(capturedBody);
    const body = JSON.parse(capturedBody);
    assert.ok(body.message.includes("Test error message"));
    assert.strictEqual(body.priority, -1);
    assert.strictEqual(body.sound, "none");
  });
});
