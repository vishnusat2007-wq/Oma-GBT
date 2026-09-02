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
  it("answers how-are-you and asks back instead of changing topic", () => {
    const reply = mockReply(request("how are you"));
    expect(reply.toLowerCase()).toMatch(/i'?m great/);
    expect(reply.toLowerCase()).toMatch(/how are you/);
    expect(reply.toLowerCase()).not.toMatch(/space|ice cream|t-rex|that's interesting/);
  });

  it("explains a sunflower instead of pivoting to an interest", () => {
    const reply = mockReply(request("what's a sunflower"));
    expect(reply.toLowerCase()).toMatch(/sunflower/);
    expect(reply.toLowerCase()).toMatch(/plant|flower|sun/);
    expect(reply.toLowerCase()).not.toMatch(/space|unicorn/);
  });
});
