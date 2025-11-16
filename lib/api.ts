import {
  Meal,
  MealSummary,
  Category,
  Area,
  MealResponse,
  CategoryResponse,
  AreaResponse,
} from "@/types/meal";
import { withCache, CacheKeys, CACHE_TTL } from "@/lib/cache";

/**
 * Base URL for TheMealDB API
 */
const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }
}

/**
 * Search meals by name
 * @param query - Search query string
 * @returns Array of meals matching the query
 */
export async function searchMealsByName(query: string): Promise<MealSummary[]> {
  if (!query.trim()) {
    return [];
  }

  return withCache(
    CacheKeys.search(query),
    async () => {
      const data = await fetchAPI<MealResponse>(`/search.php?s=${encodeURIComponent(query)}`);
      return data.meals || [];
    },
    CACHE_TTL.SHORT
  );
}

/**
 * Get a single meal by ID
 * @param id - Meal ID
 * @returns Full meal object with all details
 */
export async function getMealById(id: string): Promise<Meal | null> {
  return withCache(
    CacheKeys.mealById(id),
    async () => {
      const data = await fetchAPI<MealResponse>(`/lookup.php?i=${id}`);
      return data.meals?.[0] || null;
    },
    CACHE_TTL.LONG
  );
}

/**
 * Get all available categories
 * @returns Array of all meal categories
 */
export async function getCategories(): Promise<Category[]> {
  return withCache(
    CacheKeys.categories(),
    async () => {
      const data = await fetchAPI<CategoryResponse>("/list.php?c=list");
      return data.meals || [];
    },
    CACHE_TTL.LONG
  );
}

/**
 * Get all available areas/cuisines
 * @returns Array of all areas
 */
export async function getAreas(): Promise<Area[]> {
  return withCache(
    CacheKeys.areas(),
    async () => {
      const data = await fetchAPI<AreaResponse>("/list.php?a=list");
      return data.meals || [];
    },
    CACHE_TTL.LONG
  );
}

/**
 * Filter meals by category
 * @param category - Category name (e.g., "Beef", "Dessert")
 * @returns Array of meals in the specified category with full details
 */
export async function filterByCategory(category: string): Promise<MealSummary[]> {
  return withCache(
    CacheKeys.filterByCategory(category),
    async () => {
      const data = await fetchAPI<MealResponse>(
        `/filter.php?c=${encodeURIComponent(category)}`
      );
      const meals = data.meals || [];
      
      // Fetch full details for each meal to get all fields including area
      const detailedMeals = await Promise.all(
        meals.map(async (meal) => {
          const fullMeal = await getMealById(meal.idMeal);
          if (!fullMeal) return null;
          
          return {
            idMeal: fullMeal.idMeal,
            strMeal: fullMeal.strMeal,
            strMealThumb: fullMeal.strMealThumb,
            strCategory: fullMeal.strCategory,
            strArea: fullMeal.strArea,
          } as MealSummary;
        })
      );
      
      // Filter out null values
      return detailedMeals.filter((meal): meal is MealSummary => meal !== null);
    },
    CACHE_TTL.MEDIUM
  );
}

/**
 * Filter meals by area/cuisine
 * @param area - Area name (e.g., "Italian", "Mexican")
 * @returns Array of meals from the specified area with full details
 */
export async function filterByArea(area: string): Promise<MealSummary[]> {
  return withCache(
    CacheKeys.filterByArea(area),
    async () => {
      const data = await fetchAPI<MealResponse>(
        `/filter.php?a=${encodeURIComponent(area)}`
      );
      const meals = data.meals || [];
      
      // Fetch full details for each meal to get all fields including category
      const detailedMeals = await Promise.all(
        meals.map(async (meal) => {
          const fullMeal = await getMealById(meal.idMeal);
          if (!fullMeal) return null;
          
          return {
            idMeal: fullMeal.idMeal,
            strMeal: fullMeal.strMeal,
            strMealThumb: fullMeal.strMealThumb,
            strCategory: fullMeal.strCategory,
            strArea: fullMeal.strArea,
          } as MealSummary;
        })
      );
      
      // Filter out null values
      return detailedMeals.filter((meal): meal is MealSummary => meal !== null);
    },
    CACHE_TTL.MEDIUM
  );
}

/**
 * Get meals by applying multiple filters
 * Implements a hybrid strategy: fetch by primary filter, then filter locally
 *
 * @param options - Filter options
 * @returns Array of meals matching all filters
 */
export async function getFilteredMeals(options: {
  categories?: string[];
  areas?: string[];
  searchQuery?: string;
}): Promise<MealSummary[]> {
  const { categories = [], areas = [], searchQuery } = options;

  // Use cache for combined filters
  return withCache(
    CacheKeys.filteredMeals(options),
    async () => performFilteredSearch(categories, areas, searchQuery),
    CACHE_TTL.MEDIUM
  );
}

/**
 * Internal function to perform the actual filtered search
 */
async function performFilteredSearch(
  categories: string[],
  areas: string[],
  searchQuery?: string
): Promise<MealSummary[]> {

  // If there's a search query, use search endpoint first
  if (searchQuery) {
    const searchResults = await searchMealsByName(searchQuery);

    // Apply client-side filtering to search results
    return searchResults.filter((meal) => {
      const categoryMatch =
        categories.length === 0 || categories.includes(meal.strCategory || "");
      const areaMatch =
        areas.length === 0 || areas.includes(meal.strArea || "");
      return categoryMatch && areaMatch;
    });
  }

  // If no search query, fetch by filters
  let results: MealSummary[] = [];

  // Strategy: fetch by category first (if selected), then filter by area client-side
  if (categories.length > 0) {
    // Fetch meals for all selected categories
    const categoryPromises = categories.map((cat) => filterByCategory(cat));
    const categoryResults = await Promise.all(categoryPromises);
    results = categoryResults.flat();

    // Remove duplicates based on meal ID
    const uniqueMeals = new Map<string, MealSummary>();
    results.forEach((meal) => {
      uniqueMeals.set(meal.idMeal, meal);
    });
    results = Array.from(uniqueMeals.values());

    // Apply area filter client-side if needed
    if (areas.length > 0) {
      results = results.filter((meal) => areas.includes(meal.strArea || ""));
    }
  } else if (areas.length > 0) {
    // If only area filters, fetch by area
    const areaPromises = areas.map((area) => filterByArea(area));
    const areaResults = await Promise.all(areaPromises);
    results = areaResults.flat();

    // Remove duplicates
    const uniqueMeals = new Map<string, MealSummary>();
    results.forEach((meal) => {
      uniqueMeals.set(meal.idMeal, meal);
    });
    results = Array.from(uniqueMeals.values());
  }

  return results;
}

/**
 * Helper function to parse ingredients from a Meal object
 * Combines ingredient and measure fields into an array of objects
 *
 * @param meal - Full meal object
 * @returns Array of ingredients with measurements
 */
export function parseIngredients(meal: Meal): Array<{ ingredient: string; measure: string }> {
  const ingredients: Array<{ ingredient: string; measure: string }> = [];

  // TheMealDB has up to 20 ingredient/measure pairs
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}` as keyof Meal];
    const measure = meal[`strMeasure${i}` as keyof Meal];

    // Only add if ingredient exists and is not empty
    if (ingredient && typeof ingredient === "string" && ingredient.trim()) {
      ingredients.push({
        ingredient: ingredient.trim(),
        measure: typeof measure === "string" ? measure.trim() : "",
      });
    }
  }

  return ingredients;
}
