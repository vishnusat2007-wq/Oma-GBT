import { convexTest } from "convex-test";
import { beforeEach, describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob(["./**/*.ts", "./**/*.js", "!./**/*.test.ts"]);
const SECRET = "a".repeat(32);

function snapshot(memories: Array<Record<string, string>> = []) {
  return {
    profile: {
      id: "child_jesvitha",
      displayName: "Jesvitha",
      ageRange: "7-8",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    memories,
  };
}

describe("Convex household memory", () => {
  beforeEach(() => {
    process.env.OMAGBT_HOUSEHOLD_SECRET = SECRET;
  });

  it("saves a snapshot, indexes memories, and loads them back", async () => {
    const t = convexTest(schema, modules);
    const saved = await t.mutation(api.household.save, {
      secret: SECRET,
      payload: snapshot([
        {
          id: "mem_teal",
          key: "Favorite color",
          value: "teal",
          category: "favorite",
          source: "child",
          createdAt: "2026-01-02T00:00:00.000Z",
        },
      ]),
    });
    expect(saved.ok).toBe(true);
    expect(saved.memoryCount).toBe(1);

    const loaded = await t.query(api.household.load, { secret: SECRET });
    expect(loaded.householdId).toBe("jesvitha");
    expect(loaded.memoryCount).toBe(1);
    expect(loaded.payload.profile.displayName).toBe("Jesvitha");
    expect(loaded.payload.memories).toHaveLength(1);
    expect(loaded.updatedAt).toBeTruthy();
  });

  it("replaces memories instead of appending duplicates", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(api.household.save, {
      secret: SECRET,
      payload: snapshot([
        { id: "mem_1", key: "Favorite color", value: "purple", category: "favorite", source: "child", createdAt: "2026-01-01T00:00:00.000Z" },
        { id: "mem_2", key: "Loves", value: "space", category: "hobby", source: "child", createdAt: "2026-01-01T00:00:00.000Z" },
      ]),
    });
    const saved = await t.mutation(api.household.save, {
      secret: SECRET,
      payload: snapshot([
        { id: "mem_teal", key: "Favorite color", value: "teal", category: "favorite", source: "child", createdAt: "2026-01-03T00:00:00.000Z" },
      ]),
    });
    expect(saved.memoryCount).toBe(1);
    const loaded = await t.query(api.household.load, { secret: SECRET });
    expect(loaded.memoryCount).toBe(1);
    expect(loaded.payload.memories[0].value).toBe("teal");
  });

  it("wipes the snapshot and every memory", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(api.household.save, {
      secret: SECRET,
      payload: snapshot([
        { id: "mem_teal", key: "Favorite color", value: "teal", category: "favorite", source: "child", createdAt: "2026-01-02T00:00:00.000Z" },
      ]),
    });
    const wiped = await t.mutation(api.household.wipe, { secret: SECRET });
    expect(wiped).toEqual({ ok: true, householdId: "jesvitha" });
    const loaded = await t.query(api.household.load, { secret: SECRET });
    expect(loaded.payload).toBeNull();
    expect(loaded.memoryCount).toBe(0);
    expect(loaded.updatedAt).toBeNull();
  });

  it("rejects the wrong secret and does not write", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(api.household.save, {
        secret: "b".repeat(32),
        payload: snapshot([{ id: "mem_x", key: "Secret", value: "nope", category: "other", source: "child", createdAt: "2026-01-01T00:00:00.000Z" }]),
      }),
    ).rejects.toThrow(/unauthorized/);
    const loaded = await t.query(api.household.load, { secret: SECRET });
    expect(loaded.payload).toBeNull();
    expect(loaded.memoryCount).toBe(0);
  });

  it("refuses snapshots without a child name", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(api.household.save, { secret: SECRET, payload: { memories: [] } }),
    ).rejects.toThrow(/invalid snapshot/);
  });
});
