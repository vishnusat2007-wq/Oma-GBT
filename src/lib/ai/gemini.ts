import { createGoogle, type GoogleLanguageModelOptions } from "@ai-sdk/google";
import { env, getGeminiApiKey } from "@/lib/env";
import { streamCompanionReply } from "./stream";
import type { AiProvider, AiRequest } from "./types";

/**
 * Strict Gemini safety filters for a child companion.
 * Categories match @ai-sdk/google GoogleLanguageModelOptions.
 */
export const GEMINI_KID_SAFETY_SETTINGS: NonNullable<
  GoogleLanguageModelOptions["safetySettings"]
> = [
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_LOW_AND_ABOVE" },
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_LOW_AND_ABOVE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_LOW_AND_ABOVE" },
  { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "BLOCK_LOW_AND_ABOVE" },
];

export function geminiProviderOptions(): { google: GoogleLanguageModelOptions } {
  return { google: { safetySettings: GEMINI_KID_SAFETY_SETTINGS } };
}

/** Google AI Studio / Gemini adapter (https://aistudio.google.com/apikey). */
export const geminiProvider: AiProvider = {
  id: "gemini",
  async stream(req: AiRequest): Promise<ReadableStream<Uint8Array>> {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key is not configured.");
    }

    const google = createGoogle({ apiKey });
    return streamCompanionReply(req, google(env.server.AI_MODEL), {
      providerOptions: geminiProviderOptions(),
    });
  },
};
