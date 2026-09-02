import { streamText, type LanguageModel } from "ai";
import { buildSystemPrompt } from "./prompt";
import type { AiRequest } from "./types";

export function streamCompanionReply(
  req: AiRequest,
  model: LanguageModel,
): ReadableStream<Uint8Array> {
  const result = streamText({
    model,
    system: buildSystemPrompt(req.context),
    messages: req.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content })),
    temperature: 0.85,
    maxOutputTokens: 800,
  });

  return result.textStream.pipeThrough(new TextEncoderStream());
}
