import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import Pagination from "@/components/Pagination";

describe("Pagination", () => {
  it("should render without crashing", () => {
    const mockOnPageChange = jest.fn();
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    );

    expect(container).toBeInTheDocument();
  });
});
