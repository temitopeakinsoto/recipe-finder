import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import FilterPanel from "@/components/FilterPanel";

describe("FilterPanel", () => {
  it("should render without crashing", () => {
    const mockCategoryToggle = jest.fn();
    const mockAreaToggle = jest.fn();
    const { container } = render(
      <FilterPanel
        categories={[]}
        areas={[]}
        selectedCategories={[]}
        selectedAreas={[]}
        onCategoryToggle={mockCategoryToggle}
        onAreaToggle={mockAreaToggle}
      />
    );

    expect(container).toBeInTheDocument();
  });
});
