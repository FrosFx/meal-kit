// Jednostavan rate limit sa fiksnim prozorom, u memoriji procesa.
// Na serverless platformi svaka instanca ima svoj brojač, pa je ovo
// "best effort" zaštita od zloupotrebe, ne garantovan globalni limit.

interface Bucket {
  count: number;
  resetAt: number;
}

const MAX_KEYS = 5000;

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds: number;
}

export function createRateLimiter(limit: number, windowMs: number) {
  const buckets = new Map<string, Bucket>();

  return function check(key: string, now = Date.now()): RateLimitResult {
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      if (buckets.size >= MAX_KEYS) {
        for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
        if (buckets.size >= MAX_KEYS) buckets.delete(buckets.keys().next().value!);
      }
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    return {
      ok: bucket.count <= limit,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  };
}
