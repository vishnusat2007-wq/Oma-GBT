import { z } from "zod";
import { getAiProvider } from "@/lib/ai";
import { checkUserInput } from "@/lib/safety/moderation";
import { rateLimit } from "@/lib/rate-limit";
import { getAiRuntimeStatus, isAiConfigured } from "@/lib/env";
import { FRIENDLY_CHAT_ERROR } from "@/lib/ai/stream";

export const runtime = "nodejs";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(4000),
});

const contextSchema = z.object({
  companionName: z.string().max(40).default("Pip"),
  childName: z.string().max(40).default("friend"),
  ageRange: z.string().max(10).default("7-8"),
  personality: z.array(z.string().max(20)).max(6).default([]),
  interests: z.array(z.string().max(30)).max(12).default([]),
  memories: z
    .array(z.object({ key: z.string().max(60), value: z.string().max(200) }))
    .max(50)
    .default([]),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(50),
  context: contextSchema,
});

function streamFromText(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const tokens = text.match(/\S+\s*/g) ?? [text];
  return new ReadableStream({
    async start(controller) {
      for (const token of tokens) {
        controller.enqueue(encoder.encode(token));
        await new Promise((r) => setTimeout(r, 14));
      }
      controller.close();
    },
  });
}

const SECURITY_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Content-Type": "text/plain; charset=utf-8",
};

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";

  const limit = rateLimit(`chat:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!limit.ok) {
    return Response.json(
      { error: "Slow down a little! Please try again in a moment." },
      { status: 429, headers: { "Retry-After": "20" } },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "That message didn't look right." },
      { status: 400 },
    );
  }

  const { messages, context } = parsed.data;
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  // Server-side safety gate on the child's input.
  const safety = checkUserInput(lastUser?.content ?? "");
  if (!safety.safe && safety.response) {
    return new Response(streamFromText(safety.response), {
      headers: {
        ...SECURITY_HEADERS,
        "x-omgbt-source": "safety",
        "x-omgbt-safety": safety.category ?? "",
        "x-omgbt-action": safety.action,
        "x-omgbt-urgent": String(safety.urgent),
      },
    });
  }

  try {
    const provider = getAiProvider();
    const stream = await provider.stream({ messages, context });
    const runtime = getAiRuntimeStatus();
    return new Response(stream, {
      headers: {
        ...SECURITY_HEADERS,
        "x-omgbt-source": provider.id,
        "x-omgbt-model": runtime.aiModel,
      },
    });
  } catch (err) {
    console.error("[omgbt] chat error", {
      configured: isAiConfigured(),
      message: err instanceof Error ? err.message : "unknown",
    });
    return new Response(
      streamFromText(
        FRIENDLY_CHAT_ERROR,
      ),
      { headers: { ...SECURITY_HEADERS, "x-omgbt-source": "error" } },
    );
  }
}

export async function GET() {
  return Response.json(getAiRuntimeStatus(), {
    headers: { "Cache-Control": "no-store" },
  });
}
