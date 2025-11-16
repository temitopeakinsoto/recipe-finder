import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("should render without crashing", () => {
    const { container } = render(<EmptyState />);

    expect(container).toBeInTheDocument();
  });
});
