import { afterEach, describe, expect, it, vi } from "vitest";
import { GEMINI_KID_SAFETY_SETTINGS, geminiProviderOptions } from "./gemini";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("Gemini provider", () => {
  it("applies child-safe BLOCK_LOW_AND_ABOVE filters for every harm category", () => {
    const categories = GEMINI_KID_SAFETY_SETTINGS.map((s) => s.category);
    expect(categories).toEqual([
      "HARM_CATEGORY_HATE_SPEECH",
      "HARM_CATEGORY_HARASSMENT",
      "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      "HARM_CATEGORY_DANGEROUS_CONTENT",
      "HARM_CATEGORY_CIVIC_INTEGRITY",
    ]);
    expect(
      GEMINI_KID_SAFETY_SETTINGS.every((s) => s.threshold === "BLOCK_LOW_AND_ABOVE"),
    ).toBe(true);
  });

  it("exposes safety settings under the google providerOptions key", () => {
    expect(geminiProviderOptions()).toEqual({
      google: { safetySettings: GEMINI_KID_SAFETY_SETTINGS },
    });
  });

  it("identifies as gemini and refuses to stream without a key", async () => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    const { geminiProvider } = await import("./gemini");
    expect(geminiProvider.id).toBe("gemini");
    await expect(
      geminiProvider.stream({
        messages: [{ role: "user", content: "hi" }],
        context: {
          companionName: "Pip",
          childName: "Jesvitha",
          ageRange: "7-8",
          personality: ["kind"],
          interests: ["space"],
          memories: [],
        },
      }),
    ).rejects.toThrow(/Gemini API key is not configured/);
  });
});
