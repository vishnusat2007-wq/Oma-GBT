import "server-only";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { AppData } from "@/lib/demo/seed";

export interface CloudLoadResult {
  payload: AppData | null;
  updatedAt: string | null;
  memoryCount: number;
  householdId: string | null;
}

export function convexUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
}

/** True when the server can call the household Convex functions. */
export function isCloudSyncReady(): boolean {
  const secret = process.env.OMAGBT_HOUSEHOLD_SECRET ?? "";
  return Boolean(convexUrl()) && secret.length >= 16;
}

function client(): ConvexHttpClient | null {
  const url = convexUrl();
  if (!url || !isCloudSyncReady()) return null;
  return new ConvexHttpClient(url);
}

function secret(): string {
  return process.env.OMAGBT_HOUSEHOLD_SECRET ?? "";
}

const EMPTY: CloudLoadResult = {
  payload: null,
  updatedAt: null,
  memoryCount: 0,
  householdId: null,
};

export async function loadCloudState(): Promise<CloudLoadResult> {
  const convex = client();
  if (!convex) return EMPTY;
  const row = await convex.query(api.household.load, { secret: secret() });
  return {
    payload: (row.payload as AppData | null) ?? null,
    updatedAt: row.updatedAt,
    memoryCount: row.memoryCount,
    householdId: row.householdId,
  };
}

export async function saveCloudState(payload: AppData): Promise<void> {
  const convex = client();
  if (!convex) throw new Error("Cloud sync is not configured");
  await convex.mutation(api.household.save, { secret: secret(), payload });
}

export async function wipeCloudState(): Promise<void> {
  const convex = client();
  if (!convex) throw new Error("Cloud sync is not configured");
  await convex.mutation(api.household.wipe, { secret: secret() });
}
