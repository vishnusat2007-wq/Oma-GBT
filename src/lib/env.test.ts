import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

function withoutGeminiKeys(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const next = { ...env };
  delete next.GOOGLE_GENERATIVE_AI_API_KEY;
  delete next.GEMINI_API_KEY;
  delete next.GOOGLE_API_KEY;
  delete next.AI_API_KEY;
  return next;
}

describe("resolveAiProviderId", () => {
  it("prefers Gemini when GOOGLE_GENERATIVE_AI_API_KEY is set", async () => {
    process.env = {
      ...withoutGeminiKeys(ORIGINAL_ENV),
      GOOGLE_GENERATIVE_AI_API_KEY: "test-gemini-key",
      AI_API_KEY: "test-openai-key",
      AI_PROVIDER: "auto",
    };
    const { resolveAiProviderId } = await import("@/lib/env");
    expect(resolveAiProviderId()).toBe("gemini");
  });

  it("accepts GEMINI_API_KEY as an alias", async () => {
    process.env = {
      ...withoutGeminiKeys(ORIGINAL_ENV),
      GEMINI_API_KEY: "alias-gemini-key",
      AI_PROVIDER: "auto",
    };
    const { resolveAiProviderId, getGeminiApiKey } = await import("@/lib/env");
    expect(getGeminiApiKey()).toBe("alias-gemini-key");
    expect(resolveAiProviderId()).toBe("gemini");
  });

  it("does not treat generic GOOGLE_API_KEY as a Gemini key", async () => {
    process.env = {
      ...withoutGeminiKeys(ORIGINAL_ENV),
      GOOGLE_API_KEY: "maps-or-search-key",
      AI_PROVIDER: "auto",
    };
    const { resolveAiProviderId, getGeminiApiKey } = await import("@/lib/env");
    expect(getGeminiApiKey()).toBeUndefined();
    expect(resolveAiProviderId()).toBe("mock");
  });

  it("falls back to mock when AI_PROVIDER=gemini but no Gemini key is set", async () => {
    process.env = {
      ...withoutGeminiKeys(ORIGINAL_ENV),
      AI_PROVIDER: "gemini",
    };
    const { resolveAiProviderId } = await import("@/lib/env");
    expect(resolveAiProviderId()).toBe("mock");
  });

  it("uses OpenAI when only AI_API_KEY is set", async () => {
    process.env = {
      ...withoutGeminiKeys(ORIGINAL_ENV),
      AI_API_KEY: "test-openai-key",
      AI_PROVIDER: "auto",
    };
    const { resolveAiProviderId } = await import("@/lib/env");
    expect(resolveAiProviderId()).toBe("openai");
  });

  it("returns mock when no keys are configured", async () => {
    process.env = {
      ...withoutGeminiKeys(ORIGINAL_ENV),
      AI_PROVIDER: "auto",
    };
    const { resolveAiProviderId } = await import("@/lib/env");
    expect(resolveAiProviderId()).toBe("mock");
  });

  it("defaults Gemini model to gemini-3.6-flash", async () => {
    process.env = {
      ...withoutGeminiKeys(ORIGINAL_ENV),
      GOOGLE_GENERATIVE_AI_API_KEY: "test-gemini-key",
      AI_PROVIDER: "auto",
    };
    const { env, DEFAULT_GEMINI_MODEL } = await import("@/lib/env");
    expect(DEFAULT_GEMINI_MODEL).toBe("gemini-3.6-flash");
    expect(env.server.AI_MODEL).toBe("gemini-3.6-flash");
  });

  it("honors an explicit AI_MODEL override", async () => {
    process.env = {
      ...withoutGeminiKeys(ORIGINAL_ENV),
      GOOGLE_GENERATIVE_AI_API_KEY: "test-gemini-key",
      AI_MODEL: "gemini-2.5-flash",
      AI_PROVIDER: "gemini",
    };
    const { env } = await import("@/lib/env");
    expect(env.server.AI_MODEL).toBe("gemini-2.5-flash");
  });
});

describe("getAiRuntimeStatus", () => {
  it("reports Gemini without exposing the API key", async () => {
    process.env = {
      ...withoutGeminiKeys(ORIGINAL_ENV),
      GOOGLE_GENERATIVE_AI_API_KEY: "secret-must-not-leak",
      AI_PROVIDER: "auto",
    };
    const { getAiRuntimeStatus } = await import("@/lib/env");
    const status = getAiRuntimeStatus();
    expect(status).toEqual({
      status: "ok",
      service: "omgbt-chat",
      aiConfigured: true,
      aiProvider: "gemini",
      aiModel: "gemini-3.6-flash",
    });
    expect(JSON.stringify(status)).not.toContain("secret-must-not-leak");
  });

  it("reports mock when Gemini is not configured", async () => {
    process.env = {
      ...withoutGeminiKeys(ORIGINAL_ENV),
      AI_PROVIDER: "auto",
    };
    const { getAiRuntimeStatus } = await import("@/lib/env");
    expect(getAiRuntimeStatus().aiConfigured).toBe(false);
    expect(getAiRuntimeStatus().aiProvider).toBe("mock");
  });
});
