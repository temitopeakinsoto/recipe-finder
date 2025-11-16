import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FilterPanel from "@/components/FilterPanel";
import type { Category, Area } from "@/types/meal";

const mockCategories: Category[] = [
  { strCategory: "Beef" },
  { strCategory: "Chicken" },
  { strCategory: "Dessert" },
];

const mockAreas: Area[] = [
  { strArea: "Italian" },
  { strArea: "Mexican" },
  { strArea: "Chinese" },
];

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

  it("should render filters title", () => {
    render(
      <FilterPanel
        categories={mockCategories}
        areas={mockAreas}
        selectedCategories={[]}
        selectedAreas={[]}
        onCategoryToggle={jest.fn()}
        onAreaToggle={jest.fn()}
      />
    );

    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("should render all categories", () => {
    render(
      <FilterPanel
        categories={mockCategories}
        areas={mockAreas}
        selectedCategories={[]}
        selectedAreas={[]}
        onCategoryToggle={jest.fn()}
        onAreaToggle={jest.fn()}
      />
    );

    expect(screen.getByText("Beef")).toBeInTheDocument();
    expect(screen.getByText("Chicken")).toBeInTheDocument();
    expect(screen.getByText("Dessert")).toBeInTheDocument();
  });

  it("should render all areas", () => {
    render(
      <FilterPanel
        categories={mockCategories}
        areas={mockAreas}
        selectedCategories={[]}
        selectedAreas={[]}
        onCategoryToggle={jest.fn()}
        onAreaToggle={jest.fn()}
      />
    );

    expect(screen.getByText("Italian")).toBeInTheDocument();
    expect(screen.getByText("Mexican")).toBeInTheDocument();
    expect(screen.getByText("Chinese")).toBeInTheDocument();
  });

  it("should render section titles", () => {
    render(
      <FilterPanel
        categories={mockCategories}
        areas={mockAreas}
        selectedCategories={[]}
        selectedAreas={[]}
        onCategoryToggle={jest.fn()}
        onAreaToggle={jest.fn()}
      />
    );

    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("Cuisines")).toBeInTheDocument();
  });

  it("should call onCategoryToggle when category checkbox is clicked", () => {
    const mockCategoryToggle = jest.fn();

    render(
      <FilterPanel
        categories={mockCategories}
        areas={mockAreas}
        selectedCategories={[]}
        selectedAreas={[]}
        onCategoryToggle={mockCategoryToggle}
        onAreaToggle={jest.fn()}
      />
    );

    const beefCheckbox = screen.getByLabelText("Filter by Beef");
    fireEvent.click(beefCheckbox);

    expect(mockCategoryToggle).toHaveBeenCalledWith("Beef");
    expect(mockCategoryToggle).toHaveBeenCalledTimes(1);
  });

  it("should call onAreaToggle when area checkbox is clicked", () => {
    const mockAreaToggle = jest.fn();

    render(
      <FilterPanel
        categories={mockCategories}
        areas={mockAreas}
        selectedCategories={[]}
        selectedAreas={[]}
        onCategoryToggle={jest.fn()}
        onAreaToggle={mockAreaToggle}
      />
    );

    const italianCheckbox = screen.getByLabelText("Filter by Italian");
    fireEvent.click(italianCheckbox);

    expect(mockAreaToggle).toHaveBeenCalledWith("Italian");
    expect(mockAreaToggle).toHaveBeenCalledTimes(1);
  });

  it("should show selected categories as checked", () => {
    render(
      <FilterPanel
        categories={mockCategories}
        areas={mockAreas}
        selectedCategories={["Beef", "Dessert"]}
        selectedAreas={[]}
        onCategoryToggle={jest.fn()}
        onAreaToggle={jest.fn()}
      />
    );

    const beefCheckbox = screen.getByLabelText("Filter by Beef") as HTMLInputElement;
    const chickenCheckbox = screen.getByLabelText("Filter by Chicken") as HTMLInputElement;
    const dessertCheckbox = screen.getByLabelText("Filter by Dessert") as HTMLInputElement;

    expect(beefCheckbox.checked).toBe(true);
    expect(chickenCheckbox.checked).toBe(false);
    expect(dessertCheckbox.checked).toBe(true);
  });

  it("should show selected areas as checked", () => {
    render(
      <FilterPanel
        categories={mockCategories}
        areas={mockAreas}
        selectedCategories={[]}
        selectedAreas={["Italian"]}
        onCategoryToggle={jest.fn()}
        onAreaToggle={jest.fn()}
      />
    );

    const italianCheckbox = screen.getByLabelText("Filter by Italian") as HTMLInputElement;
    const mexicanCheckbox = screen.getByLabelText("Filter by Mexican") as HTMLInputElement;

    expect(italianCheckbox.checked).toBe(true);
    expect(mexicanCheckbox.checked).toBe(false);
  });

  it("should handle empty categories array", () => {
    render(
      <FilterPanel
        categories={[]}
        areas={mockAreas}
        selectedCategories={[]}
        selectedAreas={[]}
        onCategoryToggle={jest.fn()}
        onAreaToggle={jest.fn()}
      />
    );

    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.queryByText("Beef")).not.toBeInTheDocument();
  });

  it("should handle empty areas array", () => {
    render(
      <FilterPanel
        categories={mockCategories}
        areas={[]}
        selectedCategories={[]}
        selectedAreas={[]}
        onCategoryToggle={jest.fn()}
        onAreaToggle={jest.fn()}
      />
    );

    expect(screen.getByText("Cuisines")).toBeInTheDocument();
    expect(screen.queryByText("Italian")).not.toBeInTheDocument();
  });

  it("should allow clicking on label to toggle checkbox", () => {
    const mockCategoryToggle = jest.fn();

    render(
      <FilterPanel
        categories={mockCategories}
        areas={mockAreas}
        selectedCategories={[]}
        selectedAreas={[]}
        onCategoryToggle={mockCategoryToggle}
        onAreaToggle={jest.fn()}
      />
    );

    const beefLabel = screen.getByText("Beef");
    fireEvent.click(beefLabel);

    expect(mockCategoryToggle).toHaveBeenCalledWith("Beef");
  });

  it("should have proper ARIA labels for accessibility", () => {
    render(
      <FilterPanel
        categories={mockCategories}
        areas={mockAreas}
        selectedCategories={[]}
        selectedAreas={[]}
        onCategoryToggle={jest.fn()}
        onAreaToggle={jest.fn()}
      />
    );

    expect(screen.getByLabelText("Filter by Beef")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by Italian")).toBeInTheDocument();
  });
});
