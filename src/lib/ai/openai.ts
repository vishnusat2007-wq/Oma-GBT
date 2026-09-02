import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@/lib/env";
import { streamCompanionReply } from "./stream";
import type { AiProvider, AiRequest } from "./types";

/**
 * Real adapter for any OpenAI-compatible provider (OpenAI, Azure OpenAI-compatible
 * gateways, local servers, etc.). Configured entirely through server env vars.
 */
export const openAiProvider: AiProvider = {
  id: "openai",
  async stream(req: AiRequest): Promise<ReadableStream<Uint8Array>> {
    const provider = createOpenAI({
      apiKey: env.server.AI_API_KEY,
      baseURL: env.server.AI_BASE_URL,
    });

    return streamCompanionReply(req, provider(env.server.AI_MODEL));
  },
};
