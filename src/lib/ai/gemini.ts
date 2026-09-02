import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { env, getGeminiApiKey } from "@/lib/env";
import { streamCompanionReply } from "./stream";
import type { AiProvider, AiRequest } from "./types";

/** Google AI Studio / Gemini adapter (https://aistudio.google.com/apikey). */
export const geminiProvider: AiProvider = {
  id: "gemini",
  async stream(req: AiRequest): Promise<ReadableStream<Uint8Array>> {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key is not configured.");
    }

    const google = createGoogleGenerativeAI({ apiKey });
    return streamCompanionReply(req, google(env.server.AI_MODEL));
  },
};
