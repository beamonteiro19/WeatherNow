export interface CacheEntry<T> {
  value: T;
  expiresAt: number; // epoch ms
}

/**
 * Simple time-based cache using localStorage (browser) with a memory fallback.
 */
class TimeCache {
  private memory = new Map<string, CacheEntry<unknown>>();

  private hasStorage(): boolean {
    try {
      const key = "__cache_test__";
      window.localStorage.setItem(key, "1");
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttlMs };

    if (this.hasStorage()) {
      const payload = JSON.stringify(entry);
      window.localStorage.setItem(key, payload);
    } else {
      this.memory.set(key, entry);
    }
  }

  get<T>(key: string): T | null {
    const now = Date.now();

    if (this.hasStorage()) {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      try {
        const entry = JSON.parse(raw) as CacheEntry<T>;
        if (typeof entry.expiresAt !== "number") {
          window.localStorage.removeItem(key);
          return null;
        }
        if (entry.expiresAt <= now) {
          window.localStorage.removeItem(key);
          return null;
        }
        return entry.value;
      } catch {
        window.localStorage.removeItem(key);
        return null;
      }
    }

    const entry = this.memory.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (entry.expiresAt <= now) {
      this.memory.delete(key);
      return null;
    }
    return entry.value;
  }

  remove(key: string): void {
    if (this.hasStorage()) {
      window.localStorage.removeItem(key);
    }
    this.memory.delete(key);
  }
}

export const cache = new TimeCache();

/**
 * Helper to wrap async producers with cache.
 */
export async function getOrSet<T>(key: string, ttlMs: number, producer: () => Promise<T>): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== null) return cached;
  const value = await producer();
  cache.set<T>(key, value, ttlMs);
  return value;
}
