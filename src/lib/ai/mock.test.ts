import { describe, expect, it } from "vitest";
import { mockReply } from "./mock";
import type { AiRequest } from "./types";

function request(content: string): AiRequest {
  return {
    messages: [{ role: "user", content }],
    context: {
      companionName: "Pip",
      childName: "Jesvitha",
      ageRange: "7-8",
      personality: ["gentle"],
      interests: ["space"],
      memories: [],
    },
  };
}

describe("mockReply greetings", () => {
  it("answers how-are-you and asks Jesvitha back instead of changing topic", () => {
    const reply = mockReply(request("how are you"));
    expect(reply.toLowerCase()).toMatch(/feeling|great|curious|fine|good/);
    expect(reply).toMatch(/How are you, Jesvitha\?/);
    expect(reply.toLowerCase()).not.toMatch(/space|ice cream|that's interesting/);
  });
});
