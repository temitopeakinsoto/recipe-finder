/**
 * Props for the ActiveFilters component
 */
interface ActiveFiltersProps {
  /** Array of currently selected category filter names */
  selectedCategories: string[];
  /** Array of currently selected area/cuisine filter names */
  selectedAreas: string[];
  /** Callback function when a category filter is removed */
  onRemoveCategory: (category: string) => void;
  /** Callback function when an area filter is removed */
  onRemoveArea: (area: string) => void;
}
/**
 * ActiveFilters Component
 *
 * Displays currently active filters as dismissible badges.
 * Each badge shows the filter type (Category/Area) and value,
 * and clicking a badge removes that filter via callback.
 * Returns null if no filters are active.
 *
 * Features:
 * - Color-coded badges (blue for categories, green for areas)
 * - Click to remove individual filters
 * - Calls parent callbacks to update filter state
 * - Accessible with proper ARIA labels
 *
 * @example
 * ```tsx
 * <ActiveFilters
 *   selectedCategories={["Beef", "Dessert"]}
 *   selectedAreas={["Italian", "Chinese"]}
 *   onRemoveCategory={(cat) => console.log('Remove', cat)}
 *   onRemoveArea={(area) => console.log('Remove', area)}
 * />
 * ```
 */
export default function ActiveFilters({
  selectedCategories,
  selectedAreas,
  onRemoveCategory,
  onRemoveArea,
}: ActiveFiltersProps) {
  if (selectedCategories.length === 0 && selectedAreas.length === 0) {
    return null;
  }

  return (
    <FilterBadgeGroup>
      {selectedCategories.map((category) => (
        <FilterBadge
          key={`category-${category}`}
          variant="blue"
          label="Category"
          value={category}
          onRemove={() => onRemoveCategory(category)}
        />
      ))}
      {selectedAreas.map((area) => (
        <FilterBadge
          key={`area-${area}`}
          variant="green"
          label="Area"
          value={area}
          onRemove={() => onRemoveArea(area)}
        />
      ))}
    </FilterBadgeGroup>
  );
}

// Active filter sub-components

interface FilterBadgeGroupProps {
  children: React.ReactNode;
}

function FilterBadgeGroup({ children }: FilterBadgeGroupProps) {
  return <div className="mb-4 flex flex-wrap gap-2">{children}</div>;
}

interface FilterBadgeProps {
  variant: "blue" | "green";
  label: string;
  value: string;
  onRemove: () => void;
}

function FilterBadge({ variant, label, value, onRemove }: FilterBadgeProps) {
  const variants = {
    blue: {
      badge: "bg-blue-100 text-blue-800",
      hover: "hover:bg-blue-200",
    },
    green: {
      badge: "bg-green-100 text-green-800",
      hover: "hover:bg-green-200",
    },
  };

  return (
    <button
      onClick={onRemove}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors cursor-pointer ${variants[variant].badge} ${variants[variant].hover}`}
      aria-label={`Remove ${value} filter`}
    >
      <span>
        {label}: {value}
      </span>
      <span aria-hidden="true">×</span>
    </button>
  );
}
