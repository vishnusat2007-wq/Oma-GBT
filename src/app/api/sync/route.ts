import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { hasSessionCookie } from "@/lib/cloud/session";
import { parseCloudPayload, serializeAppData } from "@/lib/cloud/payload";
import { isCloudSyncReady, loadCloudState, saveCloudState, wipeCloudState } from "@/lib/cloud/server";

export const runtime = "nodejs";

function clientKey(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

async function requireSession(request: Request) {
  const limit = rateLimit(`sync:${clientKey(request)}`, { limit: 40, windowMs: 60_000 });
  if (!limit.ok) {
    return Response.json({ error: "Slow down a little." }, { status: 429 });
  }
  if (!(await hasSessionCookie())) {
    return Response.json({ error: "Sign in first." }, { status: 401 });
  }
  return null;
}

export async function GET(request: Request) {
  const blocked = await requireSession(request);
  if (blocked) return blocked;
  if (!isCloudSyncReady()) {
    return Response.json({ cloud: false, payload: null, memoryCount: 0 });
  }
  try {
    const loaded = await loadCloudState();
    return Response.json({
      cloud: true,
      payload: loaded.payload,
      updatedAt: loaded.updatedAt,
      memoryCount: loaded.memoryCount,
    });
  } catch (err) {
    console.error("[omagbt] cloud load failed", err);
    return Response.json({ cloud: false, error: "Could not load cloud memory." }, { status: 503 });
  }
}

const putSchema = z.object({
  payload: z.unknown(),
});

export async function PUT(request: Request) {
  const blocked = await requireSession(request);
  if (blocked) return blocked;
  if (!isCloudSyncReady()) {
    return Response.json({ cloud: false, error: "Cloud memory is not configured." }, { status: 503 });
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid body." }, { status: 400 });
  }
  const parsed = putSchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "Invalid snapshot." }, { status: 400 });
  const payload = parseCloudPayload(parsed.data.payload);
  if (!payload) return Response.json({ error: "Snapshot is missing required fields." }, { status: 400 });
  try {
    await saveCloudState(serializeAppData(payload as unknown as Record<string, unknown>));
    return Response.json({ cloud: true, ok: true });
  } catch (err) {
    console.error("[omagbt] cloud save failed", err);
    return Response.json({ error: "Could not save cloud memory." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const blocked = await requireSession(request);
  if (blocked) return blocked;
  if (!isCloudSyncReady()) {
    return Response.json({ cloud: false, ok: true, skipped: true });
  }
  try {
    await wipeCloudState();
    return Response.json({ cloud: true, ok: true });
  } catch (err) {
    console.error("[omagbt] cloud wipe failed", err);
    return Response.json({ error: "Could not delete cloud data." }, { status: 503 });
  }
}
