import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchBar from "@/components/SearchBar";

describe("SearchBar", () => {
  it("should render without crashing", () => {
    const mockOnSearch = jest.fn();
    const { container } = render(<SearchBar onSearch={mockOnSearch} />);

    expect(container).toBeInTheDocument();
  });
});
