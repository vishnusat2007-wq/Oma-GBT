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

  it("answers the child's question first and treats interests as optional flavor", () => {
    expect(prompt).toContain("## Answer first (always)");
    expect(prompt).toContain("optional flavor — never a checklist");
    expect(prompt).toContain("Use name, personality, interests, or memories only when they fit naturally");
    expect(prompt).toContain("Never force them into a reply");
    expect(prompt).toContain("Do not say the name every message");
    expect(prompt).not.toContain("say it at least once in every reply");
    expect(prompt).not.toContain("Bring at least one in naturally");
    expect(prompt).not.toContain("use these EVERY reply");
    expect(prompt).toContain("Jesvitha");
    expect(prompt).toContain("silly, curious");
    expect(prompt).toContain("space, unicorns");
    expect(prompt).toContain("favorite color: purple");
  });

  it("requires a direct greeting answer and a kid-friendly explanation for what-is questions", () => {
    expect(prompt).toMatch(/how are you/i);
    expect(prompt).toContain("briefly say how you feel, then ask how they are");
    expect(prompt).toContain("Do not pivot to a random interest");
    expect(prompt).toContain('"What is X" / explain questions');
    expect(prompt).toContain("give a clear kid-friendly explanation of X first");
    expect(prompt).toContain("A sunflower is a tall plant");
    expect(prompt).toContain("Safety rules (never break these)");
  });

  it("keeps exact name spelling when the name is used, without requiring it every turn", () => {
    expect(prompt).toContain('spell it exactly "Jesvitha"');
    expect(prompt).toContain('never write "Jeevotha"');
    expect(prompt).toContain("You do not have to say the name in every message");
  });

  it("bans bland assistant filler and keeps a short kid voice", () => {
    expect(prompt).toMatch(/not a generic chatbot/i);
    expect(prompt).toContain("That's interesting!");
    expect(prompt).toContain("1–3 sentences");
    expect(prompt).toMatch(/never break these/i);
    expect(prompt).toContain("Sound like a real warm playful friend, not a template");
  });
});
