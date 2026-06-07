/**
 * In-Memory Rate Limiter with Sliding Window
 * 
 * Uses a Map to track request counts per key (e.g., IP address).
 * Supports configurable limits and time windows.
 * Cleans up expired entries every 5 minutes.
 * 
 * Note: This works for single-instance deployment. For multi-instance,
 * you would need Redis or a shared store.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Default configurations
export const AUTH_LIMIT = 5; // 5 requests per minute for auth endpoints
export const AUTH_WINDOW_MS = 60 * 1000; // 1 minute

export const API_LIMIT = 60; // 60 requests per minute for general API
export const API_WINDOW_MS = 60 * 1000; // 1 minute

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      // Remove timestamps outside the largest possible window
      const filteredTimestamps = entry.timestamps.filter(
        (ts) => now - ts < API_WINDOW_MS * 2
      );

      if (filteredTimestamps.length === 0) {
        store.delete(key);
      } else {
        entry.timestamps = filteredTimestamps;
      }
    }
  }, CLEANUP_INTERVAL);

  // Don't prevent process exit
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

// Start cleanup on module load
startCleanup();

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

/**
 * Check rate limit for a given key
 * 
 * @param key - Unique identifier (e.g., IP address)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result with success status and metadata
 */
export function rateLimit(
  key: string,
  limit: number = API_LIMIT,
  windowMs: number = API_WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get or create entry
  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Filter out timestamps outside the current window (sliding window)
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  // Check if limit exceeded
  const currentCount = entry.timestamps.length;
  const remaining = Math.max(0, limit - currentCount);

  if (currentCount >= limit) {
    // Find the oldest timestamp in the window to calculate reset time
    const oldestInWindow = entry.timestamps[0] || now;
    const resetAt = oldestInWindow + windowMs;

    return {
      success: false,
      remaining: 0,
      resetAt,
      limit,
    };
  }

  // Record this request
  entry.timestamps.push(now);

  return {
    success: true,
    remaining: remaining - 1, // Subtract 1 for current request
    resetAt: now + windowMs,
    limit,
  };
}

/**
 * Get the client IP from a request
 */
export function getClientIp(request: Request): string {
  // Check various headers that might contain the real IP
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Fallback for local development
  return "unknown";
}
