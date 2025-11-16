import {
  searchMealsByName,
  getMealById,
  getCategories,
  getAreas,
  filterByCategory,
  filterByArea,
  getFilteredMeals,
  parseIngredients,
  ApiError,
} from "./api";
import { clearCache } from "./cache";
import type { Meal } from "@/types/meal";

// Mock fetch globally
global.fetch = jest.fn();

describe("API Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearCache(); // Clear cache between tests
  });

  describe("ApiError", () => {
    it("should create an error with message", () => {
      const error = new ApiError("Test error");
      expect(error.message).toBe("Test error");
      expect(error.name).toBe("ApiError");
    });

    it("should create an error with status code", () => {
      const error = new ApiError("Not found", 404);
      expect(error.message).toBe("Not found");
      expect(error.statusCode).toBe(404);
    });
  });

  describe("searchMealsByName", () => {
    it("should return empty array for empty query", async () => {
      const result = await searchMealsByName("");
      expect(result).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("should return empty array for whitespace-only query", async () => {
      const result = await searchMealsByName("   ");
      expect(result).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("should fetch and return meals for valid query", async () => {
      const mockMeals = [
        { idMeal: "1", strMeal: "Pasta", strMealThumb: "img.jpg" },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: mockMeals }),
      });

      const result = await searchMealsByName("pasta");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/search.php?s=pasta")
      );
      expect(result).toEqual(mockMeals);
    });

    it("should return empty array when API returns null meals", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: null }),
      });

      const result = await searchMealsByName("nonexistent");
      expect(result).toEqual([]);
    });

    it("should encode special characters in search query", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: [] }),
      });

      await searchMealsByName("chicken & rice");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("chicken%20%26%20rice")
      );
    });

    it("should throw ApiError on network failure", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      await expect(searchMealsByName("test")).rejects.toThrow(ApiError);
    });

    it("should throw ApiError on HTTP error", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(searchMealsByName("test")).rejects.toThrow(ApiError);
    });

    it("should use cache for repeated queries", async () => {
      const mockMeals = [{ idMeal: "1", strMeal: "Pasta" }];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: mockMeals }),
      });

      // First call should fetch
      const result1 = await searchMealsByName("pasta");
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await searchMealsByName("pasta");
      expect(fetch).toHaveBeenCalledTimes(1); // No additional fetch
      expect(result1).toEqual(result2);
    });
  });

  describe("getMealById", () => {
    it("should fetch and return meal by ID", async () => {
      const mockMeal = { idMeal: "52772", strMeal: "Teriyaki Chicken" };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: [mockMeal] }),
      });

      const result = await getMealById("52772");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/lookup.php?i=52772")
      );
      expect(result).toEqual(mockMeal);
    });

    it("should return null when meal not found", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: null }),
      });

      const result = await getMealById("99999");
      expect(result).toBeNull();
    });

    it("should use cache for repeated requests", async () => {
      const mockMeal = { idMeal: "52772", strMeal: "Teriyaki Chicken" };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: [mockMeal] }),
      });

      await getMealById("52772");
      await getMealById("52772");

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("getCategories", () => {
    it("should fetch and return categories", async () => {
      const mockCategories = [
        { strCategory: "Beef" },
        { strCategory: "Chicken" },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: mockCategories }),
      });

      const result = await getCategories();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/list.php?c=list")
      );
      expect(result).toEqual(mockCategories);
    });

    it("should return empty array when no categories", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: null }),
      });

      const result = await getCategories();
      expect(result).toEqual([]);
    });
  });

  describe("getAreas", () => {
    it("should fetch and return areas", async () => {
      const mockAreas = [{ strArea: "Italian" }, { strArea: "Mexican" }];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: mockAreas }),
      });

      const result = await getAreas();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/list.php?a=list")
      );
      expect(result).toEqual(mockAreas);
    });
  });

  describe("filterByCategory", () => {
    it("should fetch meals by category", async () => {
      const mockMeals = [{ idMeal: "1", strMeal: "Beef Wellington", strMealThumb: "img.jpg" }];
      const mockFullMeal = {
        idMeal: "1",
        strMeal: "Beef Wellington",
        strMealThumb: "img.jpg",
        strCategory: "Beef",
        strArea: "British",
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ meals: mockMeals }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ meals: [mockFullMeal] }),
        });

      const result = await filterByCategory("Beef");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/filter.php?c=Beef")
      );
      expect(result).toEqual([
        {
          idMeal: "1",
          strMeal: "Beef Wellington",
          strMealThumb: "img.jpg",
          strCategory: "Beef",
          strArea: "British",
        }
      ]);
    });

    it("should encode category names with spaces", async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ meals: [] }),
        });

      await filterByCategory("Side Dish");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("Side%20Dish")
      );
    });
  });

  describe("filterByArea", () => {
    it("should fetch meals by area", async () => {
      const mockMeals = [{ idMeal: "1", strMeal: "Pizza", strMealThumb: "img.jpg" }];
      const mockFullMeal = {
        idMeal: "1",
        strMeal: "Pizza",
        strMealThumb: "img.jpg",
        strCategory: "Pasta",
        strArea: "Italian",
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ meals: mockMeals }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ meals: [mockFullMeal] }),
        });

      const result = await filterByArea("Italian");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/filter.php?a=Italian")
      );
      expect(result).toEqual([
        {
          idMeal: "1",
          strMeal: "Pizza",
          strMealThumb: "img.jpg",
          strCategory: "Pasta",
          strArea: "Italian",
        }
      ]);
    });
  });

  describe("getFilteredMeals", () => {
    it("should return search results when search query is provided", async () => {
      const mockMeals = [
        {
          idMeal: "1",
          strMeal: "Chicken Pasta",
          strCategory: "Chicken",
          strArea: "Italian",
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: mockMeals }),
      });

      const result = await getFilteredMeals({ searchQuery: "pasta" });

      expect(result).toEqual(mockMeals);
    });

    it("should filter search results by category", async () => {
      const mockMeals = [
        {
          idMeal: "1",
          strMeal: "Chicken Pasta",
          strCategory: "Chicken",
          strArea: "Italian",
        },
        {
          idMeal: "2",
          strMeal: "Beef Pasta",
          strCategory: "Beef",
          strArea: "Italian",
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: mockMeals }),
      });

      const result = await getFilteredMeals({
        searchQuery: "pasta",
        categories: ["Chicken"],
      });

      expect(result).toHaveLength(1);
      expect(result[0].strCategory).toBe("Chicken");
    });

    it("should filter search results by area", async () => {
      const mockMeals = [
        {
          idMeal: "1",
          strMeal: "Italian Pasta",
          strCategory: "Pasta",
          strArea: "Italian",
        },
        {
          idMeal: "2",
          strMeal: "Mexican Pasta",
          strCategory: "Pasta",
          strArea: "Mexican",
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: mockMeals }),
      });

      const result = await getFilteredMeals({
        searchQuery: "pasta",
        areas: ["Italian"],
      });

      expect(result).toHaveLength(1);
      expect(result[0].strArea).toBe("Italian");
    });

    it("should fetch by category when no search query", async () => {
      const mockMeals = [{ idMeal: "1", strMeal: "Beef Wellington", strMealThumb: "img.jpg" }];
      const mockFullMeal = {
        idMeal: "1",
        strMeal: "Beef Wellington",
        strMealThumb: "img.jpg",
        strCategory: "Beef",
        strArea: "British",
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ meals: mockMeals }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ meals: [mockFullMeal] }),
        });

      const result = await getFilteredMeals({ categories: ["Beef"] });

      expect(result).toEqual([
        {
          idMeal: "1",
          strMeal: "Beef Wellington",
          strMealThumb: "img.jpg",
          strCategory: "Beef",
          strArea: "British",
        }
      ]);
    });

    it("should fetch by area when no search query or categories", async () => {
      const mockMeals = [{ idMeal: "1", strMeal: "Pizza", strMealThumb: "img.jpg" }];
      const mockFullMeal = {
        idMeal: "1",
        strMeal: "Pizza",
        strMealThumb: "img.jpg",
        strCategory: "Pasta",
        strArea: "Italian",
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ meals: mockMeals }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ meals: [mockFullMeal] }),
        });

      const result = await getFilteredMeals({ areas: ["Italian"] });

      expect(result).toEqual([
        {
          idMeal: "1",
          strMeal: "Pizza",
          strMealThumb: "img.jpg",
          strCategory: "Pasta",
          strArea: "Italian",
        }
      ]);
    });

    it("should remove duplicate meals when filtering by multiple categories", async () => {
      const mockMeal = { idMeal: "1", strMeal: "Hybrid Dish", strMealThumb: "img.jpg" };
      const mockFullMeal = {
        idMeal: "1",
        strMeal: "Hybrid Dish",
        strMealThumb: "img.jpg",
        strCategory: "Beef",
        strArea: "American",
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ meals: [mockMeal] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ meals: [mockFullMeal] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ meals: [mockMeal] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ meals: [mockFullMeal] }),
        });

      const result = await getFilteredMeals({
        categories: ["Beef", "Chicken"],
      });

      expect(result).toHaveLength(1);
    });
  });

  describe("parseIngredients", () => {
    it("should parse ingredients from meal object", () => {
      const meal = {
        strIngredient1: "Chicken",
        strMeasure1: "500g",
        strIngredient2: "Salt",
        strMeasure2: "1 tsp",
        strIngredient3: "",
        strMeasure3: "",
      } as Partial<Meal> as Meal;

      const ingredients = parseIngredients(meal);

      expect(ingredients).toHaveLength(2);
      expect(ingredients[0]).toEqual({ ingredient: "Chicken", measure: "500g" });
      expect(ingredients[1]).toEqual({ ingredient: "Salt", measure: "1 tsp" });
    });

    it("should filter out empty ingredients", () => {
      const meal = {
        strIngredient1: "Flour",
        strMeasure1: "200g",
        strIngredient2: "",
        strMeasure2: "",
        strIngredient3: "   ",
        strMeasure3: "1 cup",
      } as Partial<Meal> as Meal;

      const ingredients = parseIngredients(meal);

      expect(ingredients).toHaveLength(1);
      expect(ingredients[0].ingredient).toBe("Flour");
    });

    it("should handle missing measure values", () => {
      const meal = {
        strIngredient1: "Salt",
        strMeasure1: undefined,
      } as Partial<Meal> as Meal;

      const ingredients = parseIngredients(meal);

      expect(ingredients).toHaveLength(1);
      expect(ingredients[0]).toEqual({ ingredient: "Salt", measure: "" });
    });

    it("should trim whitespace from ingredients and measures", () => {
      const meal = {
        strIngredient1: "  Chicken  ",
        strMeasure1: "  500g  ",
      } as Partial<Meal> as Meal;

      const ingredients = parseIngredients(meal);

      expect(ingredients[0]).toEqual({ ingredient: "Chicken", measure: "500g" });
    });

    it("should handle all 20 ingredient slots", () => {
      const meal = {} as Partial<Meal> as Meal;

      // Add 20 ingredients
      for (let i = 1; i <= 20; i++) {
        meal[`strIngredient${i}` as keyof Meal] = `Ingredient ${i}` as never;
        meal[`strMeasure${i}` as keyof Meal] = `${i} unit` as never;
      }

      const ingredients = parseIngredients(meal);

      expect(ingredients).toHaveLength(20);
      expect(ingredients[19]).toEqual({
        ingredient: "Ingredient 20",
        measure: "20 unit",
      });
    });
  });
});
