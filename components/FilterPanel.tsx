import type { Category, Area } from "@/types/meal";

/**
 * Props for the FilterPanel component
 */
interface FilterPanelProps {
  /** Array of available category options */
  categories: Category[];
  /** Array of available area/cuisine options */
  areas: Area[];
  /** Array of currently selected categories */
  selectedCategories: string[];
  /** Array of currently selected areas */
  selectedAreas: string[];
  /** Callback when a category is toggled */
  onCategoryToggle: (category: string) => void;
  /** Callback when an area is toggled */
  onAreaToggle: (area: string) => void;
}

/**
 * FilterPanel Component (Placeholder)
 *
 * Placeholder component for filter functionality.
 * To be implemented with category and area/cuisine filters.
 *
 * The component receives all necessary props for implementation:
 * - categories/areas: Available filter options
 * - selectedCategories/selectedAreas: Currently active filters
 * - onCategoryToggle/onAreaToggle: Callbacks to update filter state
 *
 * This should be implemented with checkboxes or similar UI controls.
 **/
export default function FilterPanel({
  categories,
  areas,
  selectedCategories,
  selectedAreas,
  onCategoryToggle,
  onAreaToggle,
}: FilterPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Filters</h2>
      <p className="text-sm text-gray-500 mb-4">
        Filter controls to be implemented here.
      </p>
      <div className="text-xs text-gray-400">
        <p>Categories: {categories.length}</p>
        <p>Areas: {areas.length}</p>
        <p>Selected: {selectedCategories.length + selectedAreas.length}</p>
      </div>
    </div>
  );
}
