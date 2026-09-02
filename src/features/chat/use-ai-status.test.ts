import { describe, expect, it } from "vitest";
import { providerLabel } from "./use-ai-status";

describe("providerLabel", () => {
  it("names known providers for the UI", () => {
    expect(providerLabel("gemini")).toBe("Gemini");
    expect(providerLabel("openai")).toBe("OpenAI");
    expect(providerLabel("mock")).toBe("Local companion");
    expect(providerLabel("other")).toBe("Connected");
  });
});
