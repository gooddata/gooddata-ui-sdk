// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UiRadio } from "../UiRadio.js";

describe("UiRadio", () => {
    it("renders an unchecked radio by default", () => {
        render(<UiRadio checked={false} />);
        expect((screen.getByRole("radio") as HTMLInputElement).checked).toBe(false);
    });

    it("renders a checked radio when checked is true", () => {
        render(<UiRadio checked />);
        expect((screen.getByRole("radio") as HTMLInputElement).checked).toBe(true);
    });

    it("applies the checked BEM modifier on the visual circle", () => {
        const { container } = render(<UiRadio checked />);
        expect(container.querySelector(".gd-ui-kit-radio__circle--checked")).toBeInTheDocument();
    });

    it("calls onChange with the change event when toggled", () => {
        const onChange = vi.fn();
        render(<UiRadio checked={false} onChange={onChange} />);
        fireEvent.click(screen.getByRole("radio"));
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("renders the inline label when provided", () => {
        render(<UiRadio checked={false} label="Pick me" />);
        expect(screen.getByText("Pick me")).toBeInTheDocument();
    });

    it("associates the inline label with the input via htmlFor", () => {
        render(<UiRadio checked={false} label="Pick me" id="r1" />);
        expect(screen.getByText("Pick me")).toHaveAttribute("for", "r1");
        expect(screen.getByRole("radio")).toHaveAttribute("id", "r1");
    });

    it("forwards name and value attributes to the input", () => {
        render(<UiRadio checked={false} name="g1" value="option-a" />);
        const input = screen.getByRole("radio") as HTMLInputElement;
        expect(input.name).toBe("g1");
        expect(input.value).toBe("option-a");
    });

    it("disables the input when disabled", () => {
        render(<UiRadio checked={false} disabled />);
        expect(screen.getByRole("radio")).toBeDisabled();
    });
});
