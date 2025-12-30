import { checkStock } from "./checker.js";
import { sendRestockNotification, sendErrorNotification } from "./notifier.js";
import { config } from "./config.js";

async function main(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Starting stock check...`);

  try {
    const result = await checkStock();

    console.log(`Stock check result:`, {
      isInStock: result.isInStock,
      quantity: result.quantity,
      method: result.method,
    });

    if (result.isInStock) {
      console.log("Product is in stock! Sending notification...");

      if (config.dryRun) {
        console.log("[DRY RUN] Would send notification:", result);
      } else {
        await sendRestockNotification(result);
      }
    } else {
      console.log("Product is still out of stock.");
    }
  } catch (error) {
    console.error("Error during stock check:", error);

    if (!config.dryRun && process.env.NOTIFY_ON_ERROR === "true") {
      await sendErrorNotification(error as Error);
    }

    process.exit(1);
  }
}

main();
