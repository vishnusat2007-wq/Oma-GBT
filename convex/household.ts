import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";

type DbCtx = QueryCtx | MutationCtx;

/** Single-child app. The secret, not a user id, authorizes this household. */
export const HOUSEHOLD_ID = "jesvitha";

const MAX_MEMORIES = 200;
const MAX_PAYLOAD_CHARS = 800_000;

function expectedSecret(): string {
  const value = process.env.OMAGBT_HOUSEHOLD_SECRET ?? "";
  if (value.length < 16) {
    throw new ConvexError("Cloud memory is not configured");
  }
  return value;
}

function secretsMatch(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function authorize(secret: string) {
  if (!secretsMatch(secret, expectedSecret())) {
    throw new ConvexError("unauthorized");
  }
}

function assertSnapshot(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ConvexError("invalid snapshot");
  }
  const encoded = JSON.stringify(payload);
  if (encoded.length > MAX_PAYLOAD_CHARS) {
    throw new ConvexError("snapshot is too large");
  }
  const record = payload as Record<string, unknown>;
  const profile = record.profile;
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    throw new ConvexError("invalid snapshot");
  }
  const name = (profile as { displayName?: unknown }).displayName;
  if (typeof name !== "string" || name.length < 1 || name.length > 40) {
    throw new ConvexError("invalid snapshot");
  }
  return record;
}

interface MemoryRow {
  memoryId: string;
  key: string;
  value: string;
  category: string;
  source: string;
  createdAt: string;
}

function memoriesFromPayload(payload: Record<string, unknown>): MemoryRow[] {
  const rawList = payload.memories;
  if (!Array.isArray(rawList)) return [];
  const rows: MemoryRow[] = [];
  const seen = new Set<string>();
  for (const raw of rawList.slice(0, MAX_MEMORIES)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const item = raw as Record<string, unknown>;
    const memoryId =
      typeof item.id === "string" && item.id.trim()
        ? item.id.trim().slice(0, 80)
        : `mem_${rows.length + 1}`;
    if (seen.has(memoryId)) continue;
    seen.add(memoryId);
    rows.push({
      memoryId,
      key: typeof item.key === "string" ? item.key.slice(0, 80) : "memory",
      value: typeof item.value === "string" ? item.value.slice(0, 400) : "",
      category: typeof item.category === "string" ? item.category.slice(0, 40) : "other",
      source: item.source === "companion" ? "companion" : "child",
      createdAt:
        typeof item.createdAt === "string" ? item.createdAt.slice(0, 40) : new Date(0).toISOString(),
    });
  }
  return rows;
}

async function existingSnapshot(ctx: DbCtx) {
  return ctx.db
    .query("snapshots")
    .withIndex("by_household", (q) => q.eq("householdId", HOUSEHOLD_ID))
    .unique();
}

async function existingMemories(ctx: DbCtx) {
  return ctx.db
    .query("memories")
    .withIndex("by_household", (q) => q.eq("householdId", HOUSEHOLD_ID))
    .collect();
}

export const load = query({
  args: { secret: v.string() },
  returns: v.object({
    householdId: v.string(),
    payload: v.union(v.null(), v.any()),
    updatedAt: v.union(v.null(), v.string()),
    memoryCount: v.number(),
  }),
  handler: async (ctx, args) => {
    authorize(args.secret);
    const snap = await existingSnapshot(ctx);
    const memories = await existingMemories(ctx);
    return {
      householdId: HOUSEHOLD_ID,
      payload: snap?.payload ?? null,
      updatedAt: snap ? new Date(snap.updatedAt).toISOString() : null,
      memoryCount: memories.length,
    };
  },
});

export const save = mutation({
  args: { secret: v.string(), payload: v.any() },
  returns: v.object({
    ok: v.literal(true),
    updatedAt: v.string(),
    memoryCount: v.number(),
  }),
  handler: async (ctx, args) => {
    authorize(args.secret);
    const payload = assertSnapshot(args.payload);
    const now = Date.now();
    const snap = await existingSnapshot(ctx);
    if (snap) {
      await ctx.db.patch(snap._id, { payload, updatedAt: now });
    } else {
      await ctx.db.insert("snapshots", {
        householdId: HOUSEHOLD_ID,
        payload,
        updatedAt: now,
      });
    }

    const nextMemories = memoriesFromPayload(payload);
    const current = await existingMemories(ctx);
    for (const row of current) {
      await ctx.db.delete(row._id);
    }
    for (const memory of nextMemories) {
      await ctx.db.insert("memories", { householdId: HOUSEHOLD_ID, ...memory });
    }

    return {
      ok: true as const,
      updatedAt: new Date(now).toISOString(),
      memoryCount: nextMemories.length,
    };
  },
});

export const wipe = mutation({
  args: { secret: v.string() },
  returns: v.object({
    ok: v.literal(true),
    householdId: v.string(),
  }),
  handler: async (ctx, args) => {
    authorize(args.secret);
    const snap = await existingSnapshot(ctx);
    if (snap) await ctx.db.delete(snap._id);
    const memories = await existingMemories(ctx);
    for (const row of memories) {
      await ctx.db.delete(row._id);
    }
    return { ok: true as const, householdId: HOUSEHOLD_ID };
  },
});
