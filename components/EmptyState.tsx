/**
 * Props for the EmptyState component
 */
interface EmptyStateProps {
  /** Current search query text */
  searchQuery?: string;
  /** Array of selected category names */
  selectedCategories?: string[];
  /** Array of selected area names */
  selectedAreas?: string[];
}

/**
 * EmptyState Component
 *
 * Displays an appropriate message when no meals are found. The message and
 * styling change based on whether filters/search are active.
 *
 * - With active filters: Shows "No meals found" message with red background
 * - Without filters: Shows helpful prompt message with gray background
 *
 * @example
 * ```tsx
 * // No filters active
 * <EmptyState />
 *
 * // With active search/filters
 * <EmptyState
 *   searchQuery="pasta"
 *   selectedCategories={["Dessert"]}
 *   selectedAreas={["Italian"]}
 * />
 * ```
 */
export default function EmptyState({
  searchQuery = "",
  selectedCategories = [],
  selectedAreas = [],
}: EmptyStateProps) {
  const hasActiveFilters =
    searchQuery || selectedCategories.length > 0 || selectedAreas.length > 0;

  return (
    <div
      className={`rounded-lg p-12 text-center ${
        hasActiveFilters ? "bg-red-50" : "bg-gray-100"
      }`}
    >
      <p className="text-gray-600 text-lg">
        {hasActiveFilters
          ? "No meals found. Try adjusting your search or filters."
          : "Search for a meal or use filters to discover recipes!"}
      </p>
    </div>
  );
}
