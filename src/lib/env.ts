import { z } from "zod";

/**
 * Environment configuration and validation.
 *
 * AI and storage are independent:
 *  - Without an AI key, chat uses the deterministic mock companion.
 *  - With GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY, chat uses Gemini.
 *  - Household memory lives in Convex when NEXT_PUBLIC_CONVEX_URL (or CONVEX_URL)
 *    and OMAGBT_HOUSEHOLD_SECRET are set. See src/lib/cloud/server.ts.
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
  PARENT_PIN: z.string().min(4).max(12).optional(),
});

const publicSchema = z.object({
  NEXT_PUBLIC_CONVEX_URL: z.string().url().optional(),
});

const serverEnv = serverSchema.safeParse(process.env);
const publicEnv = publicSchema.safeParse({
  NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
});

if (!serverEnv.success && typeof window === "undefined") {
  console.warn("[omgbt] Some server env vars are invalid; falling back to safe defaults.");
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
