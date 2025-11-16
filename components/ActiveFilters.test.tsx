import { render, screen, fireEvent } from "@testing-library/react";
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

  it("should return null when no filters are active", () => {
    const { container } = render(
      <ActiveFilters
        selectedCategories={[]}
        selectedAreas={[]}
        onRemoveCategory={jest.fn()}
        onRemoveArea={jest.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should display selected categories", () => {
    render(
      <ActiveFilters
        selectedCategories={["Beef", "Chicken"]}
        selectedAreas={[]}
        onRemoveCategory={jest.fn()}
        onRemoveArea={jest.fn()}
      />
    );

    expect(screen.getByText(/Category: Beef/i)).toBeInTheDocument();
    expect(screen.getByText(/Category: Chicken/i)).toBeInTheDocument();
  });

  it("should display selected areas", () => {
    render(
      <ActiveFilters
        selectedCategories={[]}
        selectedAreas={["Italian", "Mexican"]}
        onRemoveCategory={jest.fn()}
        onRemoveArea={jest.fn()}
      />
    );

    expect(screen.getByText(/Area: Italian/i)).toBeInTheDocument();
    expect(screen.getByText(/Area: Mexican/i)).toBeInTheDocument();
  });

  it("should display both categories and areas", () => {
    render(
      <ActiveFilters
        selectedCategories={["Beef"]}
        selectedAreas={["Italian"]}
        onRemoveCategory={jest.fn()}
        onRemoveArea={jest.fn()}
      />
    );

    expect(screen.getByText(/Category: Beef/i)).toBeInTheDocument();
    expect(screen.getByText(/Area: Italian/i)).toBeInTheDocument();
  });

  it("should call onRemoveCategory when category remove button is clicked", () => {
    const mockRemoveCategory = jest.fn();

    render(
      <ActiveFilters
        selectedCategories={["Beef"]}
        selectedAreas={[]}
        onRemoveCategory={mockRemoveCategory}
        onRemoveArea={jest.fn()}
      />
    );

    const removeButton = screen.getByLabelText("Remove Beef filter");
    fireEvent.click(removeButton);

    expect(mockRemoveCategory).toHaveBeenCalledWith("Beef");
    expect(mockRemoveCategory).toHaveBeenCalledTimes(1);
  });

  it("should call onRemoveArea when area remove button is clicked", () => {
    const mockRemoveArea = jest.fn();

    render(
      <ActiveFilters
        selectedCategories={[]}
        selectedAreas={["Italian"]}
        onRemoveCategory={jest.fn()}
        onRemoveArea={mockRemoveArea}
      />
    );

    const removeButton = screen.getByLabelText("Remove Italian filter");
    fireEvent.click(removeButton);

    expect(mockRemoveArea).toHaveBeenCalledWith("Italian");
    expect(mockRemoveArea).toHaveBeenCalledTimes(1);
  });

  it("should handle multiple category removals independently", () => {
    const mockRemoveCategory = jest.fn();

    render(
      <ActiveFilters
        selectedCategories={["Beef", "Chicken", "Dessert"]}
        selectedAreas={[]}
        onRemoveCategory={mockRemoveCategory}
        onRemoveArea={jest.fn()}
      />
    );

    const beefRemoveButton = screen.getByLabelText("Remove Beef filter");
    const chickenRemoveButton = screen.getByLabelText("Remove Chicken filter");

    fireEvent.click(beefRemoveButton);
    fireEvent.click(chickenRemoveButton);

    expect(mockRemoveCategory).toHaveBeenCalledWith("Beef");
    expect(mockRemoveCategory).toHaveBeenCalledWith("Chicken");
    expect(mockRemoveCategory).toHaveBeenCalledTimes(2);
  });

  it("should have proper ARIA labels for remove buttons", () => {
    render(
      <ActiveFilters
        selectedCategories={["Beef"]}
        selectedAreas={["Italian"]}
        onRemoveCategory={jest.fn()}
        onRemoveArea={jest.fn()}
      />
    );

    expect(screen.getByLabelText("Remove Beef filter")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Italian filter")).toBeInTheDocument();
  });
});
