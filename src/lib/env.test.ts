import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("resolveAiProviderId", () => {
  it("prefers Gemini when GOOGLE_GENERATIVE_AI_API_KEY is set", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      GOOGLE_GENERATIVE_AI_API_KEY: "test-gemini-key",
      AI_API_KEY: "test-openai-key",
      AI_PROVIDER: "auto",
    };
    const { resolveAiProviderId } = await import("@/lib/env");
    expect(resolveAiProviderId()).toBe("gemini");
  });

  it("uses OpenAI when only AI_API_KEY is set", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      GOOGLE_GENERATIVE_AI_API_KEY: undefined,
      GEMINI_API_KEY: undefined,
      GOOGLE_API_KEY: undefined,
      AI_API_KEY: "test-openai-key",
      AI_PROVIDER: "auto",
    };
    const { resolveAiProviderId } = await import("@/lib/env");
    expect(resolveAiProviderId()).toBe("openai");
  });

  it("returns mock when no keys are configured", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      GOOGLE_GENERATIVE_AI_API_KEY: undefined,
      GEMINI_API_KEY: undefined,
      GOOGLE_API_KEY: undefined,
      AI_API_KEY: undefined,
      AI_PROVIDER: "auto",
    };
    const { resolveAiProviderId } = await import("@/lib/env");
    expect(resolveAiProviderId()).toBe("mock");
  });

  it("defaults Gemini model to gemini-2.0-flash", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      GOOGLE_GENERATIVE_AI_API_KEY: "test-gemini-key",
      AI_PROVIDER: "auto",
    };
    const { env } = await import("@/lib/env");
    expect(env.server.AI_MODEL).toBe("gemini-2.0-flash");
  });
});
