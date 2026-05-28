// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UiRadioRow } from "../UiRadioRow.js";

describe("UiRadioRow", () => {
    it("renders the title and description", () => {
        render(<UiRadioRow checked={false} title="Restricted" description="Only listed grantees" />);
        expect(screen.getByText("Restricted")).toBeInTheDocument();
        expect(screen.getByText("Only listed grantees")).toBeInTheDocument();
    });

    it("omits description when not provided", () => {
        render(<UiRadioRow checked={false} title="Restricted" />);
        expect(screen.getByText("Restricted")).toBeInTheDocument();
        expect(screen.queryByText(/Only/)).not.toBeInTheDocument();
    });

    it("renders the trailing slot when provided", () => {
        render(<UiRadioRow checked={false} title="Workspace" trailing={<button>controls</button>} />);
        expect(screen.getByRole("button", { name: "controls" })).toBeInTheDocument();
    });

    it("checks the underlying radio when checked is true", () => {
        render(<UiRadioRow checked title="On" />);
        expect((screen.getByRole("radio") as HTMLInputElement).checked).toBe(true);
    });

    it("calls onChange when the radio is clicked", () => {
        const onChange = vi.fn();
        render(<UiRadioRow checked={false} title="Pick" onChange={onChange} />);
        fireEvent.click(screen.getByRole("radio"));
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("calls onChange when the text area is clicked", () => {
        const onChange = vi.fn();
        render(<UiRadioRow checked={false} title="Pick" onChange={onChange} />);
        fireEvent.click(screen.getByText("Pick"));
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("does not call onChange when disabled and the text area is clicked", () => {
        const onChange = vi.fn();
        render(<UiRadioRow checked={false} title="Pick" onChange={onChange} disabled />);
        fireEvent.click(screen.getByText("Pick"));
        expect(onChange).not.toHaveBeenCalled();
    });

    it("forwards dataTestId to the root element", () => {
        render(<UiRadioRow checked={false} title="X" dataTestId="row" />);
        expect(screen.getByTestId("row")).toBeInTheDocument();
    });

    it("keeps description outside the radio's label so screen readers don't announce it twice", () => {
        render(<UiRadioRow checked={false} title="Restricted" description="Only listed grantees" />);
        // The description must NOT be inside the same <label> as the radio. The label
        // contributes the accessible name; if the description sat inside the label, the
        // radio's name would include the description, then aria-describedby would announce
        // it again. We keep them siblings instead.
        const descriptionEl = screen.getByText("Only listed grantees");
        expect(descriptionEl.closest("label")).toBeNull();
    });
});
