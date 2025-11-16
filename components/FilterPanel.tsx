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
  /** Callback when clear filters button is clicked */
  onClearFilters?: () => void;
}

/**
 * FilterPanel Component
 *
 * Displays filter controls for categories and areas/cuisines.
 * Allows users to multi-select filters using checkboxes.
 */
export default function FilterPanel({
  categories,
  areas,
  selectedCategories,
  selectedAreas,
  onCategoryToggle,
  onAreaToggle,
  onClearFilters,
}: FilterPanelProps) {
  const hasActiveFilters =
    selectedCategories.length > 0 || selectedAreas.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
            aria-label="Clear all filters"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Category Filters */}
      <FilterSection
        title="Categories"
        items={categories.map((cat) => cat.strCategory)}
        selectedItems={selectedCategories}
        onToggle={onCategoryToggle}
      />

      {/* Divider */}
      <div className="my-6 border-t border-gray-200 dark:border-gray-700" />

      {/* Area Filters */}
      <FilterSection
        title="Cuisines"
        items={areas.map((area) => area.strArea)}
        selectedItems={selectedAreas}
        onToggle={onAreaToggle}
      />
    </div>
  );
}

/**
 * FilterSection Component
 * Reusable section for displaying a group of filter checkboxes
 */
interface FilterSectionProps {
  title: string;
  items: string[];
  selectedItems: string[];
  onToggle: (item: string) => void;
}

function FilterSection({
  title,
  items,
  selectedItems,
  onToggle,
}: FilterSectionProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {items.map((item) => (
          <FilterCheckbox
            key={item}
            label={item}
            checked={selectedItems.includes(item)}
            onChange={() => onToggle(item)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * FilterCheckbox Component
 * Individual checkbox for a filter option
 */
interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function FilterCheckbox({ label, checked, onChange }: FilterCheckboxProps) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
        aria-label={`Filter by ${label}`}
      />
      <label
        htmlFor={id}
        className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
      >
        {label}
      </label>
    </div>
  );
}
