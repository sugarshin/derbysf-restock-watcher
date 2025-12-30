import type { StockCheckResult, PushoverPayload } from "./types.ts";
import { config } from "./config.ts";

export async function sendRestockNotification(
  result: StockCheckResult
): Promise<void> {
  const payload: PushoverPayload = {
    token: config.pushover.appToken,
    user: config.pushover.userKey,
    title: "Derby SF リストック通知",
    message: `${result.productTitle} が入荷しました!\n\n在庫数: ${result.quantity > 0 ? result.quantity : "在庫あり"}\n検出方法: ${result.method}`,
    url: config.productUrl,
    url_title: "商品ページを開く",
    priority: 1,
    sound: "pushover",
  };

  const response = await fetch("https://api.pushover.net/1/messages.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pushover API error: ${response.status} - ${error}`);
  }

  console.log("Pushover notification sent successfully");
}

export async function sendErrorNotification(error: Error): Promise<void> {
  const payload: PushoverPayload = {
    token: config.pushover.appToken,
    user: config.pushover.userKey,
    title: "Derby SF 監視エラー",
    message: `在庫チェックでエラーが発生しました:\n${error.message}`,
    priority: -1,
    sound: "none",
  };

  await fetch("https://api.pushover.net/1/messages.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
