import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("GET /api/chat", () => {
  it("reports mock when no Gemini key is configured", async () => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.AI_API_KEY;
    const { GET } = await import("./route");
    const res = await GET();
    const json = await res.json();
    expect(json).toMatchObject({
      status: "ok",
      service: "omgbt-chat",
      aiConfigured: false,
      aiProvider: "mock",
    });
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("reports Gemini without leaking the API key", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      GOOGLE_GENERATIVE_AI_API_KEY: "secret-must-not-leak",
      AI_PROVIDER: "auto",
    };
    delete process.env.AI_API_KEY;
    const { GET } = await import("./route");
    const res = await GET();
    const json = await res.json();
    expect(json).toMatchObject({
      status: "ok",
      aiConfigured: true,
      aiProvider: "gemini",
      aiModel: "gemini-3.6-flash",
    });
    expect(JSON.stringify(json)).not.toContain("secret-must-not-leak");
  });
});
