import { z } from "zod";
import { toolSchemas, TOOLS } from "@/lib/tools/registry";
import {
  runCheckWeather,
  runWebSearch,
  validateOpenWebsite,
  type ToolResult,
} from "@/lib/tools/server";
import { rateLimit } from "@/lib/rate-limit";
import type { ToolName } from "@/lib/data/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  tool: z.enum([
    "web_search",
    "check_weather",
    "create_reminder",
    "save_note",
    "start_game",
    "open_website",
  ]),
  args: z.record(z.string(), z.unknown()),
  approved: z.boolean().default(false),
  allowlist: z.array(z.string().url()).max(100).default([]),
});

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`tools:${ip}`, { limit: 20, windowMs: 60_000 }).ok) {
    return Response.json({ error: "Too many requests." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid tool request." }, { status: 400 });
  }

  const { tool, args, approved, allowlist } = parsed.data;
  const def = TOOLS[tool as ToolName];

  const schema = toolSchemas[tool as keyof typeof toolSchemas];
  const argsParsed = schema.safeParse(args);
  if (!argsParsed.success) {
    return Response.json(
      { error: "Those tool details didn't look right.", issues: argsParsed.error.issues },
      { status: 400 },
    );
  }

  // Sensitive/online actions must never run silently.
  if (def.requiresApproval && !approved) {
    return Response.json(
      { error: "This action needs a grown-up's approval first.", requiresApproval: true },
      { status: 403 },
    );
  }

  let result: ToolResult;
  const a = argsParsed.data as Record<string, string>;
  switch (tool) {
    case "web_search":
      result = await runWebSearch(a.query);
      break;
    case "check_weather":
      result = await runCheckWeather(a.place);
      break;
    case "open_website":
      result = validateOpenWebsite(a.url, allowlist);
      break;
    case "create_reminder":
      result = { ok: true, display: `Reminder ready: “${a.title}” (${a.when}).`, data: a };
      break;
    case "save_note":
      result = { ok: true, display: `Note saved: “${a.title}”.`, data: a };
      break;
    case "start_game":
      result = { ok: true, display: `Let's play!`, data: a };
      break;
    default:
      result = { ok: false, display: "Unknown tool.", error: "UNKNOWN_TOOL" };
  }

  return Response.json(
    { tool, result },
    { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
  );
}
