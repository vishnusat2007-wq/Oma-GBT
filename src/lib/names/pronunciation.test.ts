import { describe, expect, it } from "vitest";
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
