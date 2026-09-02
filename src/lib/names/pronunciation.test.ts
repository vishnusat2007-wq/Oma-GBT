import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { fixNameMisspellings, prepareTextForSpeech } from "@/lib/names/pronunciation";

describe("fixNameMisspellings", () => {
  it("corrects common Jesvitha misspellings in AI replies", () => {
    expect(fixNameMisspellings("Hi Jeevotha!", "Jesvitha")).toBe("Hi Jesvitha!");
    expect(fixNameMisspellings("Hello jeeevotha, ready to play?", "Jesvitha")).toBe(
      "Hello Jesvitha, ready to play?",
    );
  });

  it("leaves unrelated text unchanged", () => {
    const text = "Hi friend, let's explore space!";
    expect(fixNameMisspellings(text, "Jesvitha")).toBe(text);
  });
});

describe("prepareTextForSpeech", () => {
  it("substitutes phonetic form for Jesvitha before TTS", () => {
    expect(
      prepareTextForSpeech("Hi Jesvitha, want to play?", { childName: "Jesvitha" }),
    ).toBe("Hi Jess-VEE-tha, want to play?");
  });

  it("keeps text unchanged when no pronunciation is known", () => {
    const text = "Hi Alex, want to play?";
    expect(prepareTextForSpeech(text, { childName: "Alex" })).toBe(text);
  });
});

const jesvithaPromptContext = {
  companionName: "Pip",
  childName: "Jesvitha",
  ageRange: "7-8",
  personality: ["gentle"],
  interests: ["space"],
  memories: [] as { key: string; value: string }[],
};

describe("buildSystemPrompt", () => {
  it("instructs the model to keep the child's name spelling exact", () => {
    const prompt = buildSystemPrompt(jesvithaPromptContext);
    expect(prompt).toContain('spelled exactly "Jesvitha"');
    expect(prompt).toContain('never write "Jeevotha"');
  });

  it("requires answering simple greetings before any topic change", () => {
    const prompt = buildSystemPrompt(jesvithaPromptContext);
    expect(prompt).toContain("## Conversational basics (always follow)");
    expect(prompt).toMatch(/how are you/i);
    expect(prompt).toContain("FIRST answer the question briefly in character");
    expect(prompt).toContain("THEN ask the child how they are");
    expect(prompt).toContain(
      "Do not open with an unrelated fact, joke setup, trivia, or topic change",
    );
    expect(prompt).toContain("never replace the answer with a random topic");
    expect(prompt).toContain("Safety rules (never break these)");
    expect(prompt).toContain("Weave in what you remember about Jesvitha");
  });
});
