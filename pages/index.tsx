import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import ActiveFilters from "@/components/ActiveFilters";
import MealCard from "@/components/MealCard";
import Pagination from "@/components/Pagination";
import EmptyState from "@/components/EmptyState";
import { getCategories, getAreas, getFilteredMeals } from "@/lib/api";
import type { Category, Area, MealSummary } from "@/types/meal";

/**
 * Number of meals to display per page
 */
const ITEMS_PER_PAGE = 12;

/**
 * Debounce delay for search input (in milliseconds)
 */
const SEARCH_DEBOUNCE_DELAY = 500;

/**
 * Home Page Component
 *
 * Main page for the Recipe Finder application.
 * Features:
 * - Search meals by name
 * - Filter by category and cuisine
 * - Paginated results
 * - Loading and error states
 * - Caching for improved performance
 */
export default function Home() {
  const router = useRouter();

  // Filter options state
  const [categories, setCategories] = useState<Category[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  // Filter selection state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Results state
  const [allMeals, setAllMeals] = useState<MealSummary[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Loading states
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Track if this is the initial load to prevent double fetching
  const [isInitialized, setIsInitialized] = useState(false);

  // Track previous filter values to detect actual changes
  const prevFiltersRef = useRef({
    searchQuery: "",
    categories: [] as string[],
    areas: [] as string[],
  });

  /**
   * Initialize state from URL parameters on mount
   */
  useEffect(() => {
    if (!router.isReady) return;

    const {
      q,
      categories: urlCategories,
      areas: urlAreas,
      page,
    } = router.query;

    // Set search query from URL
    if (typeof q === "string" && q) {
      setSearchQuery(q);
      setDebouncedSearchQuery(q);
    }

    // Set categories from URL
    if (urlCategories) {
      const cats = Array.isArray(urlCategories)
        ? urlCategories
        : [urlCategories];
      setSelectedCategories(cats);
    }

    // Set areas from URL
    if (urlAreas) {
      const ars = Array.isArray(urlAreas) ? urlAreas : [urlAreas];
      setSelectedAreas(ars);
    }

    // Set page from URL
    if (typeof page === "string" && page) {
      const pageNum = parseInt(page, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        setCurrentPage(pageNum);
      }
    }

    setIsInitialized(true);
  }, [router.isReady, router.query]);

  /**
   * Update URL when filters or search change
   */
  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams();

    if (debouncedSearchQuery) {
      params.set("q", debouncedSearchQuery);
    }

    if (selectedCategories.length > 0) {
      selectedCategories.forEach((cat) => params.append("categories", cat));
    }

    if (selectedAreas.length > 0) {
      selectedAreas.forEach((area) => params.append("areas", area));
    }

    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : "/";

    // Only update if URL has changed
    if (router.asPath !== newUrl) {
      router.replace(newUrl, undefined, { shallow: true });
    }
  }, [
    debouncedSearchQuery,
    selectedCategories,
    selectedAreas,
    currentPage,
    isInitialized,
    router,
  ]);

  /**
   * Load categories and areas on mount
   */
  useEffect(() => {
    async function loadFilterOptions() {
      setIsLoadingFilters(true);
      setError(null);
      try {
        const [categoriesData, areasData] = await Promise.all([
          getCategories(),
          getAreas(),
        ]);
        setCategories(categoriesData);
        setAreas(areasData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load filter options. Please refresh the page."
        );
      } finally {
        setIsLoadingFilters(false);
      }
    }

    loadFilterOptions();
  }, []);

  /**
   * Debounce search query
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /**
   * Reset to page 1 when filters change
   */
  useEffect(() => {
    if (!isInitialized) return;

    const prev = prevFiltersRef.current;

    // Check if filters actually changed (compare values, not references)
    const searchChanged = prev.searchQuery !== debouncedSearchQuery;
    const categoriesChanged =
      prev.categories.length !== selectedCategories.length ||
      !prev.categories.every((cat) => selectedCategories.includes(cat));
    const areasChanged =
      prev.areas.length !== selectedAreas.length ||
      !prev.areas.every((area) => selectedAreas.includes(area));

    if (searchChanged || categoriesChanged || areasChanged) {
      setCurrentPage(1);

      // Update ref with current values
      prevFiltersRef.current = {
        searchQuery: debouncedSearchQuery,
        categories: [...selectedCategories],
        areas: [...selectedAreas],
      };
    }
  }, [debouncedSearchQuery, selectedCategories, selectedAreas, isInitialized]);

  /**
   * Fetch meals when filters or search query change
   */
  useEffect(() => {
    async function loadMeals() {
      setIsLoadingMeals(true);
      setError(null);

      try {
        if (
          !debouncedSearchQuery &&
          selectedCategories.length === 0 &&
          selectedAreas.length === 0
        ) {
          setAllMeals([]);
          setIsLoadingMeals(false);
          return;
        }

        const meals = await getFilteredMeals({
          searchQuery: debouncedSearchQuery,
          categories: selectedCategories,
          areas: selectedAreas,
        });

        setAllMeals(meals);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load meals. Please try again."
        );
        setAllMeals([]);
      } finally {
        setIsLoadingMeals(false);
      }
    }

    loadMeals();
  }, [debouncedSearchQuery, selectedCategories, selectedAreas]);

  /**
   * Calculate paginated meals
   */
  const paginatedMeals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return allMeals.slice(startIndex, endIndex);
  }, [allMeals, currentPage]);

  /**
   * Calculate total pages
   */
  const totalPages = useMemo(() => {
    return Math.ceil(allMeals.length / ITEMS_PER_PAGE);
  }, [allMeals.length]);

  /**
   * Handle search submission
   */
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  /**
   * Handle category filter toggle
   */
  const handleCategoryToggle = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  /**
   * Handle area filter toggle
   */
  const handleAreaToggle = useCallback((area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }, []);

  /**
   * Handle category filter removal from ActiveFilters
   */
  const handleRemoveCategory = useCallback((category: string) => {
    setSelectedCategories((prev) => prev.filter((c) => c !== category));
  }, []);

  /**
   * Handle area filter removal from ActiveFilters
   */
  const handleRemoveArea = useCallback((area: string) => {
    setSelectedAreas((prev) => prev.filter((a) => a !== area));
  }, []);

  /**
   * Handle clear all filters
   */
  const handleClearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedAreas([]);
  }, []);

  /**
   * Handle page change
   */
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /**
   * Determine if we should show the empty state
   */
  const showEmptyState =
    !isLoadingMeals &&
    allMeals.length === 0 &&
    (debouncedSearchQuery ||
      selectedCategories.length > 0 ||
      selectedAreas.length > 0);

  /**
   * Show initial empty state (no search/filters)
   */
  const showInitialState =
    !isLoadingMeals &&
    !debouncedSearchQuery &&
    selectedCategories.length === 0 &&
    selectedAreas.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Recipe Finder
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search and discover delicious meals from around the world
          </p>
        </header>

        {/* Global Error Message */}
        {error && (
          <div
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
            role="alert"
          >
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            placeholder="Search for meals..."
            onSearch={handleSearch}
            defaultValue={searchQuery}
          />
        </div>

        {/* Layout: Filters on left, content on right */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            {isLoadingFilters ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ) : (
              <FilterPanel
                categories={categories}
                areas={areas}
                selectedCategories={selectedCategories}
                selectedAreas={selectedAreas}
                onCategoryToggle={handleCategoryToggle}
                onAreaToggle={handleAreaToggle}
                onClearFilters={handleClearFilters}
              />
            )}
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Active Filters */}
            <ActiveFilters
              selectedCategories={selectedCategories}
              selectedAreas={selectedAreas}
              onRemoveCategory={handleRemoveCategory}
              onRemoveArea={handleRemoveArea}
            />

            {/* Loading State */}
            {isLoadingMeals && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="p-4">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Initial State (no search or filters) */}
            {showInitialState && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-24 w-24 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Start your search
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Search for meals or select filters to discover delicious
                  recipes
                </p>
              </div>
            )}

            {/* Empty State (with filters/search but no results) */}
            {showEmptyState && (
              <EmptyState
                searchQuery={debouncedSearchQuery}
                selectedCategories={selectedCategories}
                selectedAreas={selectedAreas}
              />
            )}

            {/* Meal Grid */}
            {!isLoadingMeals && paginatedMeals.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedMeals.map((meal) => (
                    <MealCard
                      key={meal.idMeal}
                      id={meal.idMeal}
                      name={meal.strMeal}
                      thumbnail={meal.strMealThumb}
                      category={meal.strCategory}
                      area={meal.strArea}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
