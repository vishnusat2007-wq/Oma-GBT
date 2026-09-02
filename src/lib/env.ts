import { z } from "zod";

/**
 * Environment configuration and validation.
 *
 * OmaGBT runs in one of two modes:
 *  - "demo" (default): no Supabase, no AI key required. Everything works locally
 *    with seeded data and deterministic mock AI responses.
 *  - "live": Supabase + a real AI provider (Gemini via Google AI Studio, or
 *    OpenAI-compatible) are configured.
 *
 * Secrets are ONLY ever read on the server. Never import server env into client code.
 */

const serverSchema = z.object({
  AI_PROVIDER: z.enum(["auto", "gemini", "openai"]).default("auto"),
  AI_API_KEY: z.string().min(1).optional(),
  AI_BASE_URL: z.string().url().optional(),
  AI_MODEL: z.string().min(1).optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
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
  console.warn("[omgbt] Some server env vars are invalid; falling back to demo defaults.");
}

const parsedServer = serverEnv.success ? serverEnv.data : serverSchema.parse({});

/** Default Gemini model (Google AI Studio / @ai-sdk/google). Override with AI_MODEL. */
export const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";
export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

/**
 * Google AI Studio key (https://aistudio.google.com/apikey).
 * Accepts the official SDK name and a common GEMINI_API_KEY alias.
 * Does not treat generic GOOGLE_API_KEY as Gemini (that key is for other Google APIs).
 */
export function getGeminiApiKey(): string | undefined {
  return parsedServer.GOOGLE_GENERATIVE_AI_API_KEY || parsedServer.GEMINI_API_KEY;
}

function defaultModelForProvider(provider: "gemini" | "openai"): string {
  return provider === "gemini" ? DEFAULT_GEMINI_MODEL : DEFAULT_OPENAI_MODEL;
}

export function resolveAiProviderId(): "mock" | "gemini" | "openai" {
  const preference = parsedServer.AI_PROVIDER;
  const hasGemini = Boolean(getGeminiApiKey());
  const hasOpenAi = Boolean(parsedServer.AI_API_KEY);

  if (preference === "gemini" && hasGemini) return "gemini";
  if (preference === "openai" && hasOpenAi) return "openai";
  if (preference === "auto") {
    if (hasGemini) return "gemini";
    if (hasOpenAi) return "openai";
  }
  return "mock";
}

export function resolveAiModel(): string {
  if (parsedServer.AI_MODEL) return parsedServer.AI_MODEL;
  const provider = resolveAiProviderId();
  return provider === "mock" ? "mock" : defaultModelForProvider(provider);
}

export const env = {
  server: {
    ...parsedServer,
    AI_MODEL: resolveAiModel(),
  },
  public: publicEnv.success ? publicEnv.data : {},
};

/** Whether Supabase credentials are present (client-safe check). */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    env.public.NEXT_PUBLIC_SUPABASE_URL && env.public.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Whether a real AI provider is configured (server-only truth). */
export function isAiConfigured(): boolean {
  return resolveAiProviderId() !== "mock";
}

export interface AiRuntimeStatus {
  status: "ok";
  service: "omgbt-chat";
  aiConfigured: boolean;
  aiProvider: "mock" | "gemini" | "openai";
  aiModel: string;
}

/** Safe, secret-free snapshot for /api/chat GET and the parent dashboard. */
export function getAiRuntimeStatus(): AiRuntimeStatus {
  const aiProvider = resolveAiProviderId();
  return {
    status: "ok",
    service: "omgbt-chat",
    aiConfigured: aiProvider !== "mock",
    aiProvider,
    aiModel: resolveAiModel(),
  };
}

/** The app is in demo mode unless explicitly disabled AND Supabase is configured. */
export function isDemoMode(): boolean {
  if (env.public.NEXT_PUBLIC_DEMO_MODE === "false") return false;
  if (env.public.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  return !isSupabaseConfigured();
}
