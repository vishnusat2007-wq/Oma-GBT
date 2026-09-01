import type { CompanionContext } from "./prompt";

export interface AiChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AiRequest {
  messages: AiChatMessage[];
  context: CompanionContext;
}

export interface AiProvider {
  readonly id: "mock" | "openai";
  /** Returns a ReadableStream of UTF-8 text chunks (the assistant reply). */
  stream(req: AiRequest): Promise<ReadableStream<Uint8Array>>;
}
