import {
  getCached,
  setCached,
  hasCached,
  deleteCached,
  clearCache,
  cleanupCache,
  getCacheStats,
  withCache,
  CacheKeys,
  CACHE_TTL,
} from "./cache";

describe("Cache", () => {
  beforeEach(() => {
    clearCache();
  });

  describe("setCached and getCached", () => {
    it("should store and retrieve a value", () => {
      setCached("test-key", "test-value");
      expect(getCached("test-key")).toBe("test-value");
    });

    it("should store and retrieve complex objects", () => {
      const testData = { name: "Test", items: [1, 2, 3] };
      setCached("test-obj", testData);
      expect(getCached("test-obj")).toEqual(testData);
    });

    it("should return null for non-existent keys", () => {
      expect(getCached("non-existent")).toBeNull();
    });

    it("should handle different data types", () => {
      setCached("string", "hello");
      setCached("number", 42);
      setCached("boolean", true);
      setCached("array", [1, 2, 3]);
      setCached("object", { key: "value" });

      expect(getCached("string")).toBe("hello");
      expect(getCached("number")).toBe(42);
      expect(getCached("boolean")).toBe(true);
      expect(getCached("array")).toEqual([1, 2, 3]);
      expect(getCached("object")).toEqual({ key: "value" });
    });
  });

  describe("TTL (Time To Live)", () => {
    it("should expire entries after TTL", async () => {
      setCached("short-lived", "value", 50); // 50ms TTL

      expect(getCached("short-lived")).toBe("value");

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 60));

      expect(getCached("short-lived")).toBeNull();
    });

    it("should not expire entries before TTL", async () => {
      setCached("long-lived", "value", 1000); // 1s TTL

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(getCached("long-lived")).toBe("value");
    });

    it("should use default TTL when not specified", () => {
      setCached("default-ttl", "value");
      expect(getCached("default-ttl")).toBe("value");
    });
  });

  describe("hasCached", () => {
    it("should return true for existing keys", () => {
      setCached("exists", "value");
      expect(hasCached("exists")).toBe(true);
    });

    it("should return false for non-existent keys", () => {
      expect(hasCached("does-not-exist")).toBe(false);
    });

    it("should return false for expired keys", async () => {
      setCached("will-expire", "value", 50);
      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(hasCached("will-expire")).toBe(false);
    });
  });

  describe("deleteCached", () => {
    it("should delete an existing key", () => {
      setCached("to-delete", "value");
      expect(getCached("to-delete")).toBe("value");

      deleteCached("to-delete");
      expect(getCached("to-delete")).toBeNull();
    });

    it("should return true when deleting existing key", () => {
      setCached("key", "value");
      expect(deleteCached("key")).toBe(true);
    });

    it("should return false when deleting non-existent key", () => {
      expect(deleteCached("non-existent")).toBe(false);
    });
  });

  describe("clearCache", () => {
    it("should clear all cache entries", () => {
      setCached("key1", "value1");
      setCached("key2", "value2");
      setCached("key3", "value3");

      clearCache();

      expect(getCached("key1")).toBeNull();
      expect(getCached("key2")).toBeNull();
      expect(getCached("key3")).toBeNull();
    });
  });

  describe("cleanupCache", () => {
    it("should remove only expired entries", async () => {
      setCached("expired", "value", 50);
      setCached("valid", "value", 5000);

      await new Promise((resolve) => setTimeout(resolve, 60));

      cleanupCache();

      expect(getCached("expired")).toBeNull();
      expect(getCached("valid")).toBe("value");
    });
  });

  describe("getCacheStats", () => {
    it("should return correct cache size", () => {
      setCached("key1", "value1");
      setCached("key2", "value2");

      const stats = getCacheStats();
      expect(stats.size).toBe(2);
    });

    it("should return all keys", () => {
      setCached("key1", "value1");
      setCached("key2", "value2");

      const stats = getCacheStats();
      expect(stats.keys).toContain("key1");
      expect(stats.keys).toContain("key2");
    });

    it("should return empty stats for empty cache", () => {
      const stats = getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.keys).toEqual([]);
    });
  });

  describe("withCache", () => {
    it("should fetch and cache data on first call", async () => {
      const fetcher = jest.fn().mockResolvedValue("fetched-data");

      const result = await withCache("test-key", fetcher);

      expect(result).toBe("fetched-data");
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it("should return cached data on subsequent calls", async () => {
      const fetcher = jest.fn().mockResolvedValue("fetched-data");

      const result1 = await withCache("test-key", fetcher);
      const result2 = await withCache("test-key", fetcher);

      expect(result1).toBe("fetched-data");
      expect(result2).toBe("fetched-data");
      expect(fetcher).toHaveBeenCalledTimes(1); // Should only fetch once
    });

    it("should re-fetch after cache expiration", async () => {
      const fetcher = jest.fn().mockResolvedValue("fetched-data");

      await withCache("test-key", fetcher, 50);
      await new Promise((resolve) => setTimeout(resolve, 60));
      await withCache("test-key", fetcher, 50);

      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("should handle async errors", async () => {
      const error = new Error("Fetch failed");
      const fetcher = jest.fn().mockRejectedValue(error);

      await expect(withCache("test-key", fetcher)).rejects.toThrow("Fetch failed");
    });
  });

  describe("CacheKeys", () => {
    it("should generate correct categories key", () => {
      expect(CacheKeys.categories()).toBe("categories");
    });

    it("should generate correct areas key", () => {
      expect(CacheKeys.areas()).toBe("areas");
    });

    it("should generate correct search key", () => {
      expect(CacheKeys.search("Pizza")).toBe("search:pizza");
    });

    it("should normalize search queries to lowercase", () => {
      expect(CacheKeys.search("BEEF")).toBe("search:beef");
      expect(CacheKeys.search("Chicken")).toBe("search:chicken");
    });

    it("should generate correct mealById key", () => {
      expect(CacheKeys.mealById("52772")).toBe("meal:52772");
    });

    it("should generate correct filterByCategory key", () => {
      expect(CacheKeys.filterByCategory("Beef")).toBe("filter:category:Beef");
    });

    it("should generate correct filterByArea key", () => {
      expect(CacheKeys.filterByArea("Italian")).toBe("filter:area:Italian");
    });

    it("should generate correct filteredMeals key with search only", () => {
      const key = CacheKeys.filteredMeals({ searchQuery: "pasta" });
      expect(key).toBe("filtered|q:pasta");
    });

    it("should generate correct filteredMeals key with categories only", () => {
      const key = CacheKeys.filteredMeals({ categories: ["Beef", "Chicken"] });
      expect(key).toBe("filtered|c:Beef,Chicken");
    });

    it("should generate correct filteredMeals key with areas only", () => {
      const key = CacheKeys.filteredMeals({ areas: ["Italian", "Mexican"] });
      expect(key).toBe("filtered|a:Italian,Mexican");
    });

    it("should generate correct filteredMeals key with all options", () => {
      const key = CacheKeys.filteredMeals({
        searchQuery: "pasta",
        categories: ["Beef"],
        areas: ["Italian"],
      });
      expect(key).toBe("filtered|q:pasta|c:Beef|a:Italian");
    });

    it("should sort categories and areas for consistent keys", () => {
      const key1 = CacheKeys.filteredMeals({
        categories: ["Chicken", "Beef"],
        areas: ["Mexican", "Italian"],
      });
      const key2 = CacheKeys.filteredMeals({
        categories: ["Beef", "Chicken"],
        areas: ["Italian", "Mexican"],
      });
      expect(key1).toBe(key2);
    });
  });

  describe("CACHE_TTL constants", () => {
    it("should define SHORT TTL", () => {
      expect(CACHE_TTL.SHORT).toBe(2 * 60 * 1000);
    });

    it("should define MEDIUM TTL", () => {
      expect(CACHE_TTL.MEDIUM).toBe(5 * 60 * 1000);
    });

    it("should define LONG TTL", () => {
      expect(CACHE_TTL.LONG).toBe(30 * 60 * 1000);
    });
  });
});
