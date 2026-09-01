interface Bucket {
  tokens: number;
  updated: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Best-effort in-memory token-bucket rate limiter. Suitable for a single-child,
 * single-instance deployment. For multi-instance serverless, back this with a
 * shared store (e.g. Upstash Redis) — see README limitations.
 */
export function rateLimit(
  key: string,
  { limit = 30, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const refillRate = limit / windowMs;
  const b = buckets.get(key) ?? { tokens: limit, updated: now };
  const elapsed = now - b.updated;
  b.tokens = Math.min(limit, b.tokens + elapsed * refillRate);
  b.updated = now;
  if (b.tokens < 1) {
    buckets.set(key, b);
    return { ok: false, remaining: 0 };
  }
  b.tokens -= 1;
  buckets.set(key, b);
  return { ok: true, remaining: Math.floor(b.tokens) };
}
