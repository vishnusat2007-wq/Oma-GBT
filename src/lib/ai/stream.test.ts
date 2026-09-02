import { describe, expect, it } from "vitest";
import { FRIENDLY_CHAT_ERROR, consumeTextStream } from "./stream";

async function readAll(stream: ReadableStream<Uint8Array>): Promise<string> {
  const decoder = new TextDecoder();
  const reader = stream.getReader();
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    out += decoder.decode(value, { stream: true });
  }
  return out;
}

async function* fromChunks(chunks: string[]): AsyncIterable<string> {
  for (const chunk of chunks) yield chunk;
}

async function* throwsThenNothing(): AsyncIterable<string> {
  throw new Error("AI_APICallError 404 model not found");
  yield "";
}

async function* startsThenThrows(): AsyncIterable<string> {
  yield "Hi Jesvitha! ";
  throw new Error("socket hang up");
}

describe("consumeTextStream", () => {
  it("throws before creating a body when the model call fails immediately", async () => {
    await expect(consumeTextStream(throwsThenNothing())).rejects.toThrow(/AI_APICallError/);
  });

  it("throws when the stream is empty so callers never return a blank 200", async () => {
    await expect(consumeTextStream(fromChunks([]))).rejects.toThrow(/Empty AI stream/);
  });

  it("pipes a successful stream", async () => {
    const stream = await consumeTextStream(fromChunks(["Hi ", "Jesvitha"]));
    await expect(readAll(stream)).resolves.toBe("Hi Jesvitha");
  });

  it("appends the friendly error text if the stream dies after starting", async () => {
    const stream = await consumeTextStream(startsThenThrows());
    const text = await readAll(stream);
    expect(text.startsWith("Hi Jesvitha!")).toBe(true);
    expect(text).toContain(FRIENDLY_CHAT_ERROR);
  });
});
