import type { AppData } from "@/lib/demo/seed";

const APP_DATA_KEYS: (keyof AppData)[] = [
  "profile",
  "companion",
  "conversations",
  "messages",
  "memories",
  "stories",
  "games",
  "unlockedAchievements",
  "reminders",
  "notes",
  "permissions",
  "approvedWebsites",
  "toolRequests",
  "toolAudit",
  "safetyEvents",
  "preferences",
  "parent",
  "streakDays",
  "lastVisit",
];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Pull only serializable AppData fields from the live Zustand store. */
export function serializeAppData(state: Record<string, unknown>): AppData {
  const out: Record<string, unknown> = {};
  for (const key of APP_DATA_KEYS) {
    out[key] = state[key];
  }
  return out as unknown as AppData;
}

/** Accept a cloud payload only when it looks like AppData (never trust blindly). */
export function parseCloudPayload(raw: unknown): AppData | null {
  if (!isPlainObject(raw)) return null;
  if (!isPlainObject(raw.profile) || typeof raw.profile.displayName !== "string") return null;
  if (!isPlainObject(raw.companion) || typeof raw.companion.name !== "string") return null;
  if (!Array.isArray(raw.memories) || !Array.isArray(raw.conversations) || !Array.isArray(raw.messages)) {
    return null;
  }
  return serializeAppData(raw);
}
