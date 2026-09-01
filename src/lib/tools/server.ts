import "server-only";
import { sanitizeUntrustedText } from "@/lib/safety/moderation";
import { isDemoMode } from "@/lib/env";

export interface ToolResult {
  ok: boolean;
  display: string;
  data?: unknown;
  error?: string;
}

/**
 * Server-side execution for ONLINE tools (where secrets/network would live).
 * In demo mode these return safe, deterministic, clearly-fictional results and
 * never touch the network. Real adapters can be dropped in behind these funcs.
 *
 * All external text is treated as untrusted DATA and sanitized before returning.
 */

export async function runWebSearch(query: string): Promise<ToolResult> {
  const safeQuery = sanitizeUntrustedText(query);
  if (isDemoMode()) {
    return {
      ok: true,
      display: `Here are some kid-safe results about “${safeQuery}” (demo).`,
      data: {
        note: "Demo results — not a real search.",
        results: [
          { title: `Fun facts about ${safeQuery}`, source: "Kid Encyclopedia (demo)" },
          { title: `${safeQuery} for curious kids`, source: "Learn Together (demo)" },
        ],
      },
    };
  }
  // Real adapter placeholder: call a configured child-safe search API here,
  // then sanitize each result field before returning. Treat all fields as data.
  return {
    ok: false,
    display: "Search isn't set up yet. A grown-up can add a child-safe search key.",
    error: "SEARCH_NOT_CONFIGURED",
  };
}

export async function runCheckWeather(place: string): Promise<ToolResult> {
  const safePlace = sanitizeUntrustedText(place);
  if (isDemoMode()) {
    const options = [
      { emoji: "☀️", desc: "sunny", temp: 24 },
      { emoji: "⛅", desc: "partly cloudy", temp: 19 },
      { emoji: "🌧️", desc: "a little rainy", temp: 15 },
    ];
    const choice = options[safePlace.length % options.length];
    return {
      ok: true,
      display: `In ${safePlace} it's ${choice.desc} ${choice.emoji}, about ${choice.temp}°C (demo).`,
      data: { ...choice, place: safePlace, demo: true },
    };
  }
  return {
    ok: false,
    display: "Weather isn't set up yet. A grown-up can add a weather key.",
    error: "WEATHER_NOT_CONFIGURED",
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
