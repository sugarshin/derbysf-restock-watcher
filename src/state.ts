import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { StockState } from "./types.ts";

const STATE_FILE = process.env.STATE_FILE || ".cache/state.json";

export async function loadState(): Promise<StockState | null> {
  try {
    const data = await readFile(STATE_FILE, "utf-8");
    return JSON.parse(data) as StockState;
  } catch {
    return null;
  }
}

export async function saveState(state: StockState): Promise<void> {
  await mkdir(dirname(STATE_FILE), { recursive: true });
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}

export function shouldNotify(
  previousState: StockState | null,
  isNowInStock: boolean
): boolean {
  const wasOutOfStock = previousState === null || !previousState.wasInStock;
  return wasOutOfStock && isNowInStock;
}
