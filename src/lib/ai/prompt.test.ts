import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "./prompt";

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt({
    companionName: "Pip",
    childName: "Jesvitha",
    ageRange: "7-8",
    personality: ["silly", "curious", "gentle"],
    interests: ["space", "dinosaurs", "drawing"],
    memories: [
      { key: "Favorite color", value: "purple" },
      { key: "Loves", value: "dinosaurs and space" },
    ],
  });

  it("answers the child's question first and keeps interests off-limits unless asked", () => {
    expect(prompt).toContain("## Answer first (always)");
    expect(prompt).toContain("## Stay on the asked topic (hard rule)");
    expect(prompt).toContain("Treat that as background only");
    expect(prompt).toContain(
      "Unless Jesvitha's latest message is already about them, do not mention: space, dinosaurs, drawing, purple, dinosaurs and space",
    );
    expect(prompt).toContain("Do not sneak those in as size comparisons");
    expect(prompt).toContain("have you tried drawing it?");
    expect(prompt).toContain("Interests (off-limits unless they asked)");
    expect(prompt).not.toContain("say it at least once in every reply");
    expect(prompt).not.toContain("Bring at least one in naturally");
    expect(prompt).not.toContain("use these EVERY reply");
    expect(prompt).not.toContain("optional flavor — never a checklist");
    expect(prompt).toContain("Jesvitha");
    expect(prompt).toContain("silly, curious, gentle");
  });

  it("requires on-topic sunflower explanations and greeting answers with no interest hijack", () => {
    expect(prompt).toMatch(/how are you/i);
    expect(prompt).toContain("briefly say how you feel, then ask how they are");
    expect(prompt).toContain("Do not add an extra topic");
    expect(prompt).toContain("give a clear kid-friendly explanation of X only");
    expect(prompt).toContain("An optional follow-up must also be about X");
    expect(prompt).toContain("A sunflower is a tall plant with a big yellow flower");
    expect(prompt).toContain('taller than a T-Rex\'s hip! Have you ever tried drawing one?');
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
