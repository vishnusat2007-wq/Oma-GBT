import { z } from "zod";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/cloud/session";

export const runtime = "nodejs";

const AUTH_HASH =
  process.env.NEXT_PUBLIC_AUTH_HASH && process.env.NEXT_PUBLIC_AUTH_HASH.length === 64
    ? process.env.NEXT_PUBLIC_AUTH_HASH
    : "5e613be28e0ba2e3f28c3f94f7739adb7927498fb4e96561ec6e1074c7e31ed5";

const bodySchema = z.object({
  username: z.string().min(1).max(80),
  password: z.string().min(1).max(80),
});

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hashesEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });

  const candidate = await sha256Hex(`${parsed.data.username.trim()}:${parsed.data.password}`);
  if (!hashesEqual(candidate, AUTH_HASH)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return Response.json({ ok: true });
}

export async function DELETE() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return Response.json({ ok: true });
}
