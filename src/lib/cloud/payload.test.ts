import { describe, expect, it } from "vitest";
import { createInitialData } from "@/lib/demo/seed";
import { isLegacyDemoSnapshot, parseCloudPayload, serializeAppData } from "./payload";

describe("cloud payload", () => {
  it("round-trips a fresh household snapshot", () => {
    const data = createInitialData();
    const parsed = parseCloudPayload(serializeAppData(data as unknown as Record<string, unknown>));
    expect(parsed?.profile.displayName).toBe("Jesvitha");
    expect(parsed?.companion.name).toBe("Pip");
    expect(parsed?.memories).toEqual([]);
    expect(parsed?.conversations).toEqual([]);
  });

  it("rejects payloads that are missing the child profile", () => {
    expect(parseCloudPayload(null)).toBeNull();
    expect(parseCloudPayload({ companion: { name: "Pip" }, memories: [], conversations: [], messages: [] })).toBeNull();
  });

  it("recognizes the old local demo chat so it is not stored as real memory", () => {
    const legacy = createInitialData();
    legacy.conversations = [
      { id: "conv_demo_1", title: "Space adventures", createdAt: "", updatedAt: "", archived: false },
    ];
    legacy.messages = [
      {
        id: "msg_2",
        conversationId: "conv_demo_1",
        role: "user",
        content: "Tell me a space fact!",
        kind: "text",
        createdAt: "",
      },
    ];
    expect(isLegacyDemoSnapshot(legacy)).toBe(true);

    legacy.messages.push({
      id: "msg_real",
      conversationId: "conv_demo_1",
      role: "user",
      content: "my favorite color is teal",
      kind: "text",
      createdAt: "",
    });
    expect(isLegacyDemoSnapshot(legacy)).toBe(false);
  });
});
