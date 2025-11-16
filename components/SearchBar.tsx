import { useState } from "react";

/**
 * Props for the SearchBar component
 */
interface SearchBarProps {
  /** Default value to pre-populate the search input */
  defaultValue?: string;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Callback function when search is submitted */
  onSearch: (query: string) => void;
}

/**
 * SearchBar Component
 *
 * Calls onSearch callback when the form is submitted.
 *
 * Features:
 * - Client-side form submission via callback
 * - Accessible with proper ARIA labels
 * - Default placeholder text provided
 *
 * @example
 * ```tsx
 * <SearchBar
 *   defaultValue="pasta"
 *   placeholder="Search for meals..."
 *   onSearch={(query) => console.log(query)}
 * />
 * ```
 */
export default function SearchBar({
  placeholder = "Search for meals...",
  defaultValue = "",
  onSearch,
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="flex-1">
          <SearchInput
            name="search"
            value={searchValue}
            onChange={setSearchValue}
            placeholder={placeholder}
            aria-label="Search for meals"
          />
        </div>
        <SearchButton>Search</SearchButton>
      </div>
    </form>
  );
}

// Search sub-components

interface SearchInputProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
}

function SearchInput({
  name,
  value,
  onChange,
  placeholder,
  ...props
}: SearchInputProps) {
  return (
    <input
      type="text"
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      {...props}
    />
  );
}

interface SearchButtonProps {
  children: React.ReactNode;
}

function SearchButton({ children }: SearchButtonProps) {
  return (
    <button
      type="submit"
      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
    >
      {children}
    </button>
  );
}
