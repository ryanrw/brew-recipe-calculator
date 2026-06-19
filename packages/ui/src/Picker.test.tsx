import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Picker } from "./Picker";

describe("Picker", () => {
  it("renders the controlled value as selected", () => {
    render(<Picker min={8} max={25} value={15} onChange={() => {}} />);
    const selected = screen.getByRole("option", { name: "15" });
    expect(selected).toHaveAttribute("aria-selected", "true");
  });

  it("emits onChange with the clicked value", () => {
    const onChange = vi.fn();
    render(<Picker min={8} max={25} value={15} onChange={onChange} />);
    fireEvent.click(screen.getByRole("option", { name: "20" }));
    expect(onChange).toHaveBeenCalledWith(20);
  });

  it("marks only the controlled value as selected", () => {
    render(<Picker min={8} max={25} value={15} onChange={() => {}} />);
    const selected = screen.getAllByRole("option", { selected: true });
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveTextContent("15");
  });

  it("renders every value in the [min, max] range", () => {
    render(<Picker min={8} max={12} value={10} onChange={() => {}} />);
    for (const v of [8, 9, 10, 11, 12]) {
      expect(screen.getByRole("option", { name: String(v) })).toBeInTheDocument();
    }
  });

  it("supports fractional step values", () => {
    render(<Picker min={2} max={3} step={0.5} value={2.5} onChange={() => {}} />);
    expect(screen.getByRole("option", { name: "2.5" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("uses the format function for the displayed label", () => {
    render(
      <Picker
        min={2}
        max={4}
        step={0.5}
        value={3}
        onChange={() => {}}
        format={(v) => v.toFixed(1)}
      />,
    );
    expect(screen.getByRole("option", { name: "3.0" })).toBeInTheDocument();
  });
});
