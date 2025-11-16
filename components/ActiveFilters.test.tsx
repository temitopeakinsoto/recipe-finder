import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import ActiveFilters from "./ActiveFilters";

describe("ActiveFilters", () => {
  it("should render without crashing", () => {
    const mockRemoveCategory = jest.fn();
    const mockRemoveArea = jest.fn();
    const { container } = render(
      <ActiveFilters
        selectedCategories={[]}
        selectedAreas={[]}
        onRemoveCategory={mockRemoveCategory}
        onRemoveArea={mockRemoveArea}
      />
    );

    expect(container).toBeInTheDocument();
  });
});
