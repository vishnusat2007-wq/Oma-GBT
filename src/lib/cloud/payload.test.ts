import { describe, expect, it } from "vitest";
import { parseCloudPayload, serializeAppData } from "./payload";
import { createInitialData } from "@/lib/demo/seed";

describe("cloud payload", () => {
  it("round-trips initial household data", () => {
    const initial = createInitialData();
    const serialized = serializeAppData(initial as unknown as Record<string, unknown>);
    expect(serialized.memories).toEqual([]);
    expect(serialized.conversations).toEqual([]);
    expect(serialized.profile.displayName).toBe("Jesvitha");
    expect(parseCloudPayload(serialized)).toMatchObject({
      profile: { displayName: "Jesvitha" },
      companion: { name: "Pip" },
    });
  });

  it("rejects garbage payloads", () => {
    expect(parseCloudPayload(null)).toBeNull();
    expect(parseCloudPayload({ profile: { displayName: "x" } })).toBeNull();
  });

  it("fresh data is not a demo seed", () => {
    const data = createInitialData();
    expect(data.conversations.some((c) => c.id === "conv_demo_1")).toBe(false);
    expect(data.memories).toHaveLength(0);
  });
});
