/**
 * Props for the Pagination component
 */
interface PaginationProps {
  /** Current active page number (1-indexed) */
  currentPage: number;
  /** Total number of available pages */
  totalPages: number;
  /** Callback function when page changes */
  onPageChange: (page: number) => void;
}

/**
 * Generate array of page numbers and ellipsis for pagination display
 * @param currentPage - Current active page
 * @param totalPages - Total number of pages
 * @returns Array containing page numbers and "ellipsis" markers for display
 */
function getPageNumbers(
  currentPage: number,
  totalPages: number
): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = [];
  const maxVisible = 7;
  const siblingCount = 2; // Pages to show on each side of current page

  if (totalPages <= maxVisible) {
    // Show all pages if total is small enough
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Always show first page
  pages.push(1);

  // Calculate range around current page
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 2);
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPages - 1
  );

  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

  // Add left ellipsis if needed
  if (shouldShowLeftEllipsis) {
    pages.push("ellipsis");
  }

  // Add range around current page
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    pages.push(i);
  }

  // Add right ellipsis if needed
  if (shouldShowRightEllipsis) {
    pages.push("ellipsis");
  }

  // Always show last page
  pages.push(totalPages);

  return pages;
}
/**
 * Pagination Component
 *
 * Displays pagination controls with Previous/Next buttons and numbered page buttons.
 * Calls onPageChange callback when user navigates to a different page.
 * Returns null if there's only one page or less.
 *
 * Features:
 * - Smart ellipsis for large page counts (shows pages around current page)
 * - Client-side pagination via callbacks
 * - Accessible with proper ARIA labels
 * - Disabled state styling for Previous/Next when at boundaries
 *
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={2}
 *   totalPages={10}
 *   onPageChange={(page) => console.log('Go to page', page)}
 * />
 * ```
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      className="flex justify-center items-center gap-2 mt-10 mb-8"
      aria-label="Pagination"
    >
      {/* Previous Button */}
      <PaginationPrevious
        onClick={currentPage > 1 ? () => onPageChange(currentPage - 1) : undefined}
        disabled={currentPage <= 1}
      />

      {/* Page Numbers */}
      <div className="flex gap-1 mx-2">
        {pageNumbers.map((page, idx) => {
          if (page === "ellipsis") {
            return <PaginationEllipsis key={`ellipsis-${idx}`} />;
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <PaginationButton
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              isActive={isActive}
              aria-label={`Page ${pageNum}`}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNum}
            </PaginationButton>
          );
        })}
      </div>

      {/* Next Button */}
      <PaginationNext
        onClick={currentPage < totalPages ? () => onPageChange(currentPage + 1) : undefined}
        disabled={currentPage >= totalPages}
      />
    </nav>
  );
}

// Pagination subcomponents

interface PaginationButtonProps {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  "aria-label"?: string;
  "aria-current"?: "page";
}

function PaginationButton({
  onClick,
  isActive = false,
  children,
  ...props
}: PaginationButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 flex items-center justify-center rounded-md transition-all font-medium text-sm ${
        isActive
          ? "bg-blue-600 text-white shadow-sm"
          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400"
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

function PaginationEllipsis() {
  return (
    <span
      className="w-10 h-10 flex items-center justify-center text-gray-500"
      aria-hidden="true"
    >
      &hellip;
    </span>
  );
}

interface PaginationNavigationProps {
  onClick?: () => void;
  disabled: boolean;
}

function PaginationPrevious({ onClick, disabled }: PaginationNavigationProps) {
  if (disabled || !onClick) {
    return (
      <span className="min-w-[90px] px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed font-medium text-sm">
        &larr; Previous
      </span>
    );
  }

  return (
    <button
      onClick={onClick}
      className="min-w-[90px] px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-sm"
      aria-label="Previous page"
    >
      &larr; Previous
    </button>
  );
}

function PaginationNext({ onClick, disabled }: PaginationNavigationProps) {
  if (disabled || !onClick) {
    return (
      <span className="min-w-[90px] px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed font-medium text-sm">
        Next &rarr;
      </span>
    );
  }

  return (
    <button
      onClick={onClick}
      className="min-w-[90px] px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-sm"
      aria-label="Next page"
    >
      Next &rarr;
    </button>
  );
}
