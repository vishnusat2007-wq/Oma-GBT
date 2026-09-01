import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@/lib/env";
import { buildSystemPrompt } from "./prompt";
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

    const result = streamText({
      model: provider(env.server.AI_MODEL),
      system: buildSystemPrompt(req.context),
      messages: req.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.8,
      maxOutputTokens: 700,
    });

    return result.textStream.pipeThrough(new TextEncoderStream());
  },
};
