import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * One private household (Jesvitha). The Next.js server is the only caller:
 * every function checks OMAGBT_HOUSEHOLD_SECRET, which is never sent to the browser.
 *
 * `snapshots` holds the full app state (chats, stories, settings, memories).
 * `memories` mirrors the snapshot's memory list so parents can count and review
 * them without parsing the whole document.
 */
export default defineSchema({
  snapshots: defineTable({
    householdId: v.string(),
    payload: v.any(),
    updatedAt: v.number(),
  }).index("by_household", ["householdId"]),

  memories: defineTable({
    householdId: v.string(),
    memoryId: v.string(),
    key: v.string(),
    value: v.string(),
    category: v.string(),
    source: v.string(),
    createdAt: v.string(),
  }).index("by_household", ["householdId"]),
});
