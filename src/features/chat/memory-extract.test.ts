import { describe, it, expect } from "vitest";
import { extractMemories, memoryExists } from "./memory-extract";
import type { Memory } from "@/lib/data/types";

describe("memory extraction", () => {
  it("captures a favorite color", () => {
    const mems = extractMemories("my favorite color is teal");
    expect(mems).toContainEqual({ key: "Favorite color", value: "teal", category: "favorite" });
  });

  it("captures likes and learning goals", () => {
    expect(extractMemories("i love dinosaurs")).toContainEqual({
      key: "Likes",
      value: "dinosaurs",
      category: "hobby",
    });
    expect(extractMemories("i am learning multiplication")[0].category).toBe("learning");
  });

  it("does not capture private identifiers", () => {
    expect(extractMemories("my address is 22 Oak Lane")).toHaveLength(0);
    expect(extractMemories("my phone number is 555 1234")).toHaveLength(0);
    expect(extractMemories("hello there friend")).toHaveLength(0);
  });

  it("detects duplicates", () => {
    const existing: Memory[] = [
      { id: "1", key: "Favorite color", value: "teal", category: "favorite", createdAt: "", source: "child" },
    ];
    expect(memoryExists(existing, { key: "Favorite color", value: "teal", category: "favorite" })).toBe(true);
    expect(memoryExists(existing, { key: "Favorite color", value: "red", category: "favorite" })).toBe(false);
  });
});
