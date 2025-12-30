import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { checkStock } from "./checker.ts";
import { sendRestockNotification, sendErrorNotification } from "./notifier.ts";
import { config } from "./config.ts";
import type { StockState } from "./types.ts";

const STATE_FILE = process.env.STATE_FILE || ".cache/state.json";

async function loadState(): Promise<StockState | null> {
  try {
    const data = await readFile(STATE_FILE, "utf-8");
    return JSON.parse(data) as StockState;
  } catch {
    return null;
  }
}

async function saveState(state: StockState): Promise<void> {
  await mkdir(dirname(STATE_FILE), { recursive: true });
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}

async function main(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Starting stock check...`);

  try {
    const previousState = await loadState();
    const result = await checkStock();

    console.log("Stock check result:", {
      isInStock: result.isInStock,
      quantity: result.quantity,
      method: result.method,
    });

    if (previousState) {
      console.log("Previous state:", {
        wasInStock: previousState.wasInStock,
        lastCheck: previousState.lastCheck,
      });
    } else {
      console.log("No previous state found (first run)");
    }

    const wasOutOfStock = previousState === null || !previousState.wasInStock;
    const isNowInStock = result.isInStock;
    const shouldNotify = wasOutOfStock && isNowInStock;

    if (shouldNotify) {
      console.log("Restock detected! Sending notification...");

      if (config.dryRun) {
        console.log("[DRY RUN] Would send notification:", result);
      } else {
        await sendRestockNotification(result);
      }
    } else if (isNowInStock) {
      console.log("Product is in stock (already notified previously).");
    } else {
      console.log("Product is still out of stock.");
    }

    const newState: StockState = {
      lastCheck: new Date().toISOString(),
      wasInStock: result.isInStock,
      variantId: result.variantId,
    };
    await saveState(newState);
    console.log("State saved.");
  } catch (error) {
    console.error("Error during stock check:", error);

    if (!config.dryRun && process.env.NOTIFY_ON_ERROR === "true") {
      await sendErrorNotification(error as Error);
    }

    process.exit(1);
  }
}

main();
