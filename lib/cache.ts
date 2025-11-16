/**
 * Cache entry with data and expiration time
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * In-memory cache implementation with TTL (time-to-live) support
 */
class Cache {
  private cache: Map<string, CacheEntry<unknown>>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Get a value from cache
   * Returns null if key doesn't exist or has expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set a value in cache with TTL
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { data, expiresAt });
  }

  /**
   * Check if a key exists in cache and hasn't expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove all expired entries from cache
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

/**
 * Singleton cache instance
 */
const cacheInstance = new Cache();

/**
 * Cache TTL constants (in milliseconds)
 */
export const CACHE_TTL = {
  SHORT: 2 * 60 * 1000, // 2 minutes - for search results
  MEDIUM: 5 * 60 * 1000, // 5 minutes - for filtered results
  LONG: 30 * 60 * 1000, // 30 minutes - for categories, areas, meal details
} as const;

/**
 * Cache key generators for consistent key naming
 */
export const CacheKeys = {
  categories: () => "categories",
  areas: () => "areas",
  search: (query: string) => `search:${query.toLowerCase()}`,
  mealById: (id: string) => `meal:${id}`,
  filterByCategory: (category: string) => `filter:category:${category}`,
  filterByArea: (area: string) => `filter:area:${area}`,
  filteredMeals: (options: {
    categories?: string[];
    areas?: string[];
    searchQuery?: string;
  }) => {
    const parts = ["filtered"];
    if (options.searchQuery) parts.push(`q:${options.searchQuery}`);
    if (options.categories?.length) parts.push(`c:${options.categories.sort().join(",")}`);
    if (options.areas?.length) parts.push(`a:${options.areas.sort().join(",")}`);
    return parts.join("|");
  },
} as const;

/**
 * Get a value from cache
 */
export function getCached<T>(key: string): T | null {
  return cacheInstance.get<T>(key);
}

/**
 * Set a value in cache
 */
export function setCached<T>(key: string, data: T, ttl?: number): void {
  cacheInstance.set(key, data, ttl);
}

/**
 * Check if a key exists in cache
 */
export function hasCached(key: string): boolean {
  return cacheInstance.has(key);
}

/**
 * Delete a specific key from cache
 */
export function deleteCached(key: string): boolean {
  return cacheInstance.delete(key);
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cacheInstance.clear();
}

/**
 * Clean up expired entries
 */
export function cleanupCache(): void {
  cacheInstance.cleanup();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return cacheInstance.getStats();
}

/**
 * Wrapper function to cache API calls automatically
 * @param key - Cache key
 * @param fetcher - Async function that fetches the data
 * @param ttl - Time to live in milliseconds
 * @returns Cached data or freshly fetched data
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Check cache first
  const cached = getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache
  setCached(key, data, ttl);

  return data;
}

// Cleanup expired entries every 10 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    cleanupCache();
  }, 10 * 60 * 1000);
}
