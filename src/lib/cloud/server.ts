import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "@/lib/env";
import type { AppData } from "@/lib/demo/seed";

const HOUSEHOLD_SECRET = process.env.OMAGBT_HOUSEHOLD_SECRET ?? "";

export function isCloudSyncReady(): boolean {
  return isSupabaseConfigured() && HOUSEHOLD_SECRET.length >= 16;
}

function rpcClient(): SupabaseClient | null {
  if (!isCloudSyncReady()) return null;
  return createClient(
    env.public.NEXT_PUBLIC_SUPABASE_URL!,
    env.public.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export interface CloudLoadResult {
  payload: AppData | null;
  updatedAt: string | null;
  memoryCount: number;
  householdId: string | null;
}

export async function loadCloudState(): Promise<CloudLoadResult> {
  const client = rpcClient();
  if (!client) {
    return { payload: null, updatedAt: null, memoryCount: 0, householdId: null };
  }
  const { data, error } = await client.rpc("omagbt_load", { p_secret: HOUSEHOLD_SECRET });
  if (error) throw new Error(error.message);
  const row = (data ?? {}) as {
    payload?: unknown;
    updatedAt?: string | null;
    memoryCount?: number;
    householdId?: string;
  };
  return {
    payload: (row.payload as AppData | null) ?? null,
    updatedAt: row.updatedAt ?? null,
    memoryCount: Number(row.memoryCount ?? 0),
    householdId: row.householdId ?? null,
  };
}

export async function saveCloudState(payload: AppData): Promise<void> {
  const client = rpcClient();
  if (!client) throw new Error("Cloud sync is not configured");
  const { error } = await client.rpc("omagbt_save", {
    p_secret: HOUSEHOLD_SECRET,
    p_payload: payload,
  });
  if (error) throw new Error(error.message);
}

export async function wipeCloudState(): Promise<void> {
  const client = rpcClient();
  if (!client) throw new Error("Cloud sync is not configured");
  const { error } = await client.rpc("omagbt_wipe", { p_secret: HOUSEHOLD_SECRET });
  if (error) throw new Error(error.message);
}
