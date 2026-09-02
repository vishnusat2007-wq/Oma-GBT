import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("getAiProvider", () => {
  it("selects the Gemini adapter when a Gemini key is set", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      GOOGLE_GENERATIVE_AI_API_KEY: "test-gemini-key",
      AI_PROVIDER: "auto",
    };
    delete process.env.AI_API_KEY;
    const { getAiProvider } = await import("./index");
    expect(getAiProvider().id).toBe("gemini");
  });

  it("selects the mock adapter when no AI key is set", async () => {
    process.env = { ...ORIGINAL_ENV, AI_PROVIDER: "auto" };
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.AI_API_KEY;
    const { getAiProvider } = await import("./index");
    expect(getAiProvider().id).toBe("mock");
  });
});
