import type { GoogleLanguageModelOptions } from "@ai-sdk/google";
import { APICallError, streamText, type LanguageModel } from "ai";
import { buildSystemPrompt } from "./prompt";
import type { AiRequest } from "./types";

export const FRIENDLY_CHAT_ERROR =
  "Oops, my thinking cap slipped for a second! 🎩 Let's try that again in a moment.";

function errorLabel(err: unknown): string {
  if (APICallError.isInstance(err)) {
    return `AI_APICallError ${err.statusCode ?? ""} ${err.message}`.trim();
  }
  return err instanceof Error ? err.message : "unknown";
}

/**
 * Consume an AI text stream so API failures throw *before* HTTP headers are
 * sent, and so a stream that starts then dies still yields a non-empty body.
 */
export async function consumeTextStream(
  source: AsyncIterable<string>,
): Promise<ReadableStream<Uint8Array>> {
  const iterator = source[Symbol.asyncIterator]();

  let first = "";
  try {
    for (;;) {
      const next = await iterator.next();
      if (next.done) break;
      if (typeof next.value === "string" && next.value.length > 0) {
        first = next.value;
        break;
      }
    }
  } catch (err) {
    console.error("[omgbt] stream failed before first chunk", { message: errorLabel(err) });
    throw err;
  }

  if (!first) {
    throw new Error("Empty AI stream");
  }

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        controller.enqueue(encoder.encode(first));
        for (;;) {
          const next = await iterator.next();
          if (next.done) break;
          if (typeof next.value === "string" && next.value.length > 0) {
            controller.enqueue(encoder.encode(next.value));
          }
        }
        controller.close();
      } catch (err) {
        console.error("[omgbt] stream error after start", { message: errorLabel(err) });
        controller.enqueue(encoder.encode(FRIENDLY_CHAT_ERROR));
        controller.close();
      }
    },
  });
}

export async function streamCompanionReply(
  req: AiRequest,
  model: LanguageModel,
  extras?: { providerOptions?: { google?: GoogleLanguageModelOptions } },
): Promise<ReadableStream<Uint8Array>> {
  const result = streamText({
    model,
    system: buildSystemPrompt(req.context),
    messages: req.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content })),
    temperature: 0.85,
    maxOutputTokens: 800,
    providerOptions: extras?.providerOptions,
  });

  return consumeTextStream(result.textStream);
}
