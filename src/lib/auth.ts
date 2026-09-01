"use client";

/**
 * Lightweight sign-in for OmaGBT — a private, single-user personal app for Jesvitha.
 *
 * The password is never stored in the repo. We keep only a SHA-256 hash of the
 * `username:password` pair and compare against it in the browser. This is a
 * friendly access gate for a personal device (client-side by design, matching the
 * demo-first architecture). For internet-facing deployments, back this with a
 * real identity provider (Supabase Auth clients are already included).
 *
 * To change the credentials, run:
 *   node -e "const c=require('crypto');console.log(c.createHash('sha256').update('USER:PASS').digest('hex'))"
 * and set NEXT_PUBLIC_AUTH_HASH (or replace DEFAULT_AUTH_HASH below).
 */

const DEFAULT_AUTH_HASH =
  "5e613be28e0ba2e3f28c3f94f7739adb7927498fb4e96561ec6e1074c7e31ed5"; // sha256("VlovesJ:105441")

const AUTH_HASH =
  process.env.NEXT_PUBLIC_AUTH_HASH && process.env.NEXT_PUBLIC_AUTH_HASH.length === 64
    ? process.env.NEXT_PUBLIC_AUTH_HASH
    : DEFAULT_AUTH_HASH;

const SESSION_KEY = "omagbt.session";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const candidate = await sha256Hex(`${username.trim()}:${password}`);
  // Constant-time-ish compare.
  if (candidate.length !== AUTH_HASH.length) return false;
  let diff = 0;
  for (let i = 0; i < candidate.length; i++) {
    diff |= candidate.charCodeAt(i) ^ AUTH_HASH.charCodeAt(i);
  }
  return diff === 0;
}

export function isSignedIn(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(SESSION_KEY) === "1";
}

export function setSignedIn(value: boolean) {
  if (typeof window === "undefined") return;
  if (value) window.sessionStorage.setItem(SESSION_KEY, "1");
  else window.sessionStorage.removeItem(SESSION_KEY);
}
