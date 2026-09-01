import { isAiConfigured } from "@/lib/env";
import { mockProvider } from "./mock";
import { openAiProvider } from "./openai";
import type { AiProvider } from "./types";

/**
 * Selects the active AI provider. Falls back to the deterministic mock provider
 * whenever a real key is not configured, so the app always works.
 */
export function getAiProvider(): AiProvider {
  return isAiConfigured() ? openAiProvider : mockProvider;
}

export type { AiProvider, AiRequest, AiChatMessage } from "./types";
export { mockReply } from "./mock";
export { buildSystemPrompt } from "./prompt";
