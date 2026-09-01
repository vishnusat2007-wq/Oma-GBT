import { z } from "zod";
import type { ToolName } from "@/lib/data/types";

export const toolSchemas = {
  web_search: z.object({
    query: z.string().min(1).max(120),
  }),
  check_weather: z.object({
    place: z.string().min(1).max(60),
  }),
  create_reminder: z.object({
    title: z.string().min(1).max(120),
    when: z.string().min(1).max(60),
  }),
  save_note: z.object({
    title: z.string().min(1).max(80),
    body: z.string().min(1).max(600),
  }),
  start_game: z.object({
    game: z.enum([
      "tic-tac-toe",
      "memory",
      "rock-paper-scissors",
      "guess-what",
      "trivia",
      "adventure",
    ]),
  }),
  open_website: z.object({
    url: z.string().url().max(300),
    title: z.string().max(120).optional(),
  }),
} as const;

export interface ToolDef {
  name: ToolName;
  title: string;
  description: string;
  icon: string;
  /** Online tools touch the internet and always require parent approval. */
  online: boolean;
  requiresApproval: boolean;
}

export const TOOLS: Record<ToolName, ToolDef> = {
  web_search: {
    name: "web_search",
    title: "Search kid-safe knowledge",
    description: "Look something up in a child-safe knowledge source.",
    icon: "🔎",
    online: true,
    requiresApproval: true,
  },
  check_weather: {
    name: "check_weather",
    title: "Check the weather",
    description: "See the weather for a place (no exact location needed).",
    icon: "⛅",
    online: true,
    requiresApproval: true,
  },
  open_website: {
    name: "open_website",
    title: "Open an approved website",
    description: "Open a website from the parent-approved list.",
    icon: "🌐",
    online: true,
    requiresApproval: true,
  },
  create_reminder: {
    name: "create_reminder",
    title: "Make a reminder",
    description: "Save a friendly in-app reminder.",
    icon: "⏰",
    online: false,
    requiresApproval: false,
  },
  save_note: {
    name: "save_note",
    title: "Save a note",
    description: "Keep a note inside omgbt.",
    icon: "📝",
    online: false,
    requiresApproval: false,
  },
  start_game: {
    name: "start_game",
    title: "Start a game",
    description: "Jump into one of the arcade games.",
    icon: "🎮",
    online: false,
    requiresApproval: false,
  },
};

export interface ToolProposal {
  tool: ToolName;
  args: Record<string, unknown>;
  summary: string;
}

const GAME_KEYWORDS: Record<string, ToolProposal["args"]["game"] & string> = {
  "tic tac": "tic-tac-toe",
  "tic-tac": "tic-tac-toe",
  memory: "memory",
  "rock paper": "rock-paper-scissors",
  trivia: "trivia",
  quiz: "trivia",
  adventure: "adventure",
  guess: "guess-what",
};

/**
 * Deterministic intent detector. The companion *proposes* a tool; nothing runs
 * until it is approved through the UI (and parent-approved when required).
 */
export function detectToolIntent(text: string): ToolProposal | null {
  const t = text.toLowerCase().trim();
  if (!t) return null;

  const weather = t.match(/weather (?:in|for|at) ([a-z\s]{2,40})/);
  if (t.includes("weather")) {
    const place = weather?.[1]?.trim() || "my town";
    return {
      tool: "check_weather",
      args: { place },
      summary: `Check the weather in ${place}`,
    };
  }

  const remind = t.match(/remind me to (.{2,100})/);
  if (remind) {
    return {
      tool: "create_reminder",
      args: { title: remind[1].trim(), when: "later today" },
      summary: `Make a reminder: “${remind[1].trim()}”`,
    };
  }

  const note = t.match(/(?:save a note|note that|write down)[:\s]+(.{2,200})/);
  if (note) {
    return {
      tool: "save_note",
      args: { title: "Note", body: note[1].trim() },
      summary: `Save a note: “${note[1].trim()}”`,
    };
  }

  const search = t.match(/(?:search|look up|find out|google) (?:for )?(.{2,100})/);
  if (search) {
    return {
      tool: "web_search",
      args: { query: search[1].trim() },
      summary: `Search kid-safe sources for “${search[1].trim()}”`,
    };
  }

  for (const [kw, game] of Object.entries(GAME_KEYWORDS)) {
    if (t.includes(kw) && (t.includes("play") || t.includes("game"))) {
      return { tool: "start_game", args: { game }, summary: `Start ${game}` };
    }
  }

  return null;
}
