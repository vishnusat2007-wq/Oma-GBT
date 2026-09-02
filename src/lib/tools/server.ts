import "server-only";
import { sanitizeUntrustedText } from "@/lib/safety/moderation";

export interface ToolResult {
  ok: boolean;
  display: string;
  data?: unknown;
  error?: string;
}

/**
 * Server-side execution for ONLINE tools (where secrets/network would live).
 * Until a child-safe search/weather key is configured these return friendly,
 * clearly-fictional results and never touch the network.
 *
 * All external text is treated as untrusted DATA and sanitized before returning.
 */

export async function runWebSearch(query: string): Promise<ToolResult> {
  const safeQuery = sanitizeUntrustedText(query);
  return {
    ok: true,
    display: `Here are some kid-safe ideas about “${safeQuery}”.`,
    data: {
      note: "Curated kid-safe suggestions — not a live web search.",
      results: [
        { title: `Fun facts about ${safeQuery}`, source: "Kid Encyclopedia" },
        { title: `${safeQuery} for curious kids`, source: "Learn Together" },
      ],
    },
  };
}

export async function runCheckWeather(place: string): Promise<ToolResult> {
  const safePlace = sanitizeUntrustedText(place);
  const options = [
    { emoji: "☀️", desc: "sunny", temp: 24 },
    { emoji: "⛅", desc: "partly cloudy", temp: 19 },
    { emoji: "🌧️", desc: "a little rainy", temp: 15 },
  ];
  const choice = options[safePlace.length % options.length];
  return {
    ok: true,
    display: `In ${safePlace} it's ${choice.desc} ${choice.emoji}, about ${choice.temp}°C.`,
    data: { ...choice, place: safePlace },
  };
}

export function validateOpenWebsite(
  url: string,
  allowlist: string[],
): ToolResult {
  const allowed = allowlist.includes(url);
  if (!allowed) {
    return {
      ok: false,
      display: "That website isn't on the approved list. A grown-up can add it.",
      error: "NOT_ALLOWLISTED",
    };
  }
  return { ok: true, display: `Opening the approved website.`, data: { url } };
}
