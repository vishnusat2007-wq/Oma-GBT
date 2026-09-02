import { resolveAiProviderId } from "@/lib/env";
import { mockProvider } from "./mock";
import { geminiProvider } from "./gemini";
import { openAiProvider } from "./openai";
import type { AiProvider } from "./types";

/**
 * Selects the active AI provider. Prefers Gemini (Google AI Studio) when its key
 * is set, then OpenAI-compatible, otherwise the deterministic mock provider.
 */
export function getAiProvider(): AiProvider {
  switch (resolveAiProviderId()) {
    case "gemini":
      return geminiProvider;
    case "openai":
      return openAiProvider;
    default:
      return mockProvider;
  }
}

export type { AiProvider, AiRequest, AiChatMessage } from "./types";
export { mockReply } from "./mock";
export { buildSystemPrompt } from "./prompt";
