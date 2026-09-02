import { z } from "zod";

/**
 * Environment configuration and validation.
 *
 * Secrets are ONLY ever read on the server. Never import server env into client code.
 */

const serverSchema = z.object({
  AI_API_KEY: z.string().min(1).optional(),
  AI_BASE_URL: z.string().url().optional(),
  AI_MODEL: z.string().min(1).default("gpt-4o-mini"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  OMAGBT_HOUSEHOLD_SECRET: z.preprocess(
    (v) => (typeof v === "string" && v.length === 0 ? undefined : v),
    z.string().min(16).optional(),
  ),
  PARENT_PIN: z.string().min(4).max(12).optional(),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_DEMO_MODE: z.enum(["true", "false"]).optional(),
});

const serverEnv = serverSchema.safeParse(process.env);
const publicEnv = publicSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE,
});

if (!serverEnv.success && typeof window === "undefined") {
  console.warn("[omgbt] Some server env vars are invalid; using safe defaults.");
}

export const env = {
  server: serverEnv.success ? serverEnv.data : serverSchema.parse({}),
  public: publicEnv.success ? publicEnv.data : {},
};

/** True when the public Supabase URL + anon key are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    env.public.NEXT_PUBLIC_SUPABASE_URL && env.public.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Whether a real AI provider is configured (server-only truth). */
export function isAiConfigured(): boolean {
  return Boolean(env.server.AI_API_KEY);
}

/**
 * @deprecated Child-facing UI no longer has a demo-mode badge. Kept so older
 * call sites compile; now false whenever Supabase is configured.
 */
export function isDemoMode(): boolean {
  if (env.public.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  if (env.public.NEXT_PUBLIC_DEMO_MODE === "false") return false;
  return !isSupabaseConfigured();
}
