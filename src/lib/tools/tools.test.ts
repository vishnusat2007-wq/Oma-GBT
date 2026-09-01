import { describe, it, expect } from "vitest";
import { toolSchemas, TOOLS, detectToolIntent } from "./registry";

describe("tool schemas (Zod validation)", () => {
  it("accepts valid web_search args", () => {
    expect(toolSchemas.web_search.safeParse({ query: "volcanoes" }).success).toBe(true);
  });
  it("rejects empty or oversized queries", () => {
    expect(toolSchemas.web_search.safeParse({ query: "" }).success).toBe(false);
    expect(toolSchemas.web_search.safeParse({ query: "x".repeat(200) }).success).toBe(false);
  });
  it("validates open_website requires a URL", () => {
    expect(toolSchemas.open_website.safeParse({ url: "not-a-url" }).success).toBe(false);
    expect(toolSchemas.open_website.safeParse({ url: "https://ok.com" }).success).toBe(true);
  });
  it("restricts start_game to known games", () => {
    expect(toolSchemas.start_game.safeParse({ game: "trivia" }).success).toBe(true);
    expect(toolSchemas.start_game.safeParse({ game: "gambling" }).success).toBe(false);
  });
});

describe("tool permissions", () => {
  it("all online tools require parent approval", () => {
    for (const tool of Object.values(TOOLS)) {
      if (tool.online) expect(tool.requiresApproval).toBe(true);
    }
  });
  it("in-app tools do not require approval", () => {
    expect(TOOLS.save_note.requiresApproval).toBe(false);
    expect(TOOLS.create_reminder.requiresApproval).toBe(false);
    expect(TOOLS.start_game.requiresApproval).toBe(false);
  });
});

describe("tool intent detection", () => {
  it("detects weather requests", () => {
    const p = detectToolIntent("what's the weather in Paris");
    expect(p?.tool).toBe("check_weather");
    expect(p?.args.place).toContain("paris");
  });
  it("detects reminders", () => {
    expect(detectToolIntent("remind me to feed the cat")?.tool).toBe("create_reminder");
  });
  it("detects search", () => {
    expect(detectToolIntent("search for how volcanoes work")?.tool).toBe("web_search");
  });
  it("returns null for ordinary chat", () => {
    expect(detectToolIntent("tell me a story about a dragon")).toBeNull();
  });
});
