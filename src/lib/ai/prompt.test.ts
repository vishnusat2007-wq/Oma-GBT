import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "./prompt";

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt({
    companionName: "Pip",
    childName: "Jesvitha",
    ageRange: "7-8",
    personality: ["silly", "curious"],
    interests: ["space", "unicorns"],
    memories: [{ key: "favorite color", value: "purple" }],
  });

  it("requires using the child's name, personality, interests, and memories every turn", () => {
    expect(prompt).toContain("Jesvitha");
    expect(prompt).toContain("say it at least once in every reply");
    expect(prompt).toContain("silly, curious");
    expect(prompt).toContain("space, unicorns");
    expect(prompt).toContain("favorite color: purple");
    expect(prompt).toContain("Bring at least one in naturally");
  });

  it("bans bland assistant filler and keeps a short kid voice", () => {
    expect(prompt).toMatch(/not a generic chatbot/i);
    expect(prompt).toContain("That's interesting!");
    expect(prompt).toContain("1–3 sentences");
    expect(prompt).toMatch(/never break these/i);
  });
});
