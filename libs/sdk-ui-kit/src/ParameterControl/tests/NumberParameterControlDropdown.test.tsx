// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { NumberParameterControlDropdown } from "../NumberParameterControlDropdown.js";

const WrappedNumberParameterControlDropdown = withIntl(NumberParameterControlDropdown);

const renderDropdown = (props: Partial<React.ComponentProps<typeof NumberParameterControlDropdown>> = {}) => {
    return render(
        <WrappedNumberParameterControlDropdown
            name="Threshold"
            value={25}
            resetValue={25}
            constraints={{ min: 0, max: 100 }}
            onApply={() => {}}
            onCancel={() => {}}
            {...props}
        />,
    );
};

const getInput = () => screen.getByTestId("parameter-control-dropdown-input");
const getApply = () => screen.getByTestId("parameter-control-dropdown-apply");

describe("NumberParameterControlDropdown", () => {
    it("renders the input with the current value", () => {
        renderDropdown({ value: 25 });
        expect(getInput()).toHaveValue(25);
    });

    it("gives the value input an accessible name via the associated label", () => {
        renderDropdown();
        expect(screen.getByRole("spinbutton", { name: "Value" })).toBe(getInput());
    });

    it("uses the provided inputId for the value input and its label", () => {
        renderDropdown({ inputId: "my-input-id" });
        expect(screen.getByLabelText("Value").id).toBe("my-input-id");
    });

    it("exposes min and max constraints on the input", () => {
        renderDropdown();
        expect(getInput()).toHaveAttribute("min", "0");
        expect(getInput()).toHaveAttribute("max", "100");
    });

    it("calls onApply with the numeric value on Apply", () => {
        const onApply = vi.fn();
        renderDropdown({ onApply });
        fireEvent.change(getInput(), { target: { value: "42" } });
        fireEvent.click(getApply());
        expect(onApply).toHaveBeenCalledWith(42);
    });

    it("calls onCancel without applying when Cancel is clicked", () => {
        const onCancel = vi.fn();
        const onApply = vi.fn();
        renderDropdown({ onCancel, onApply });
        fireEvent.change(getInput(), { target: { value: "42" } });
        fireEvent.click(screen.getByTestId("parameter-control-dropdown-cancel"));
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onApply).not.toHaveBeenCalled();
    });

    it("disables Apply and ignores clicks when input is empty", () => {
        const onApply = vi.fn();
        renderDropdown({ onApply });
        fireEvent.change(getInput(), { target: { value: "" } });
        expect(getApply()).toBeDisabled();
        fireEvent.click(getApply());
        expect(onApply).not.toHaveBeenCalled();
    });

    it("blocks Apply and shows an error for an out-of-range value", () => {
        const onApply = vi.fn();
        renderDropdown({ onApply });
        fireEvent.change(getInput(), { target: { value: "999" } });
        expect(getApply()).toBeDisabled();
        expect(screen.getByTestId("parameter-control-dropdown-error")).toBeInTheDocument();
        fireEvent.click(getApply());
        expect(onApply).not.toHaveBeenCalled();
    });

    it("blocks Apply and shows an error for a non-numeric value", () => {
        const onApply = vi.fn();
        renderDropdown({ onApply });
        fireEvent.change(getInput(), { target: { value: "abc" } });
        expect(getApply()).toBeDisabled();
        expect(screen.getByTestId("parameter-control-dropdown-error")).toBeInTheDocument();
        fireEvent.click(getApply());
        expect(onApply).not.toHaveBeenCalled();
    });

    it("allows Apply on the inclusive boundary and commits the raw value", () => {
        const onApply = vi.fn();
        renderDropdown({ value: 100, onApply });
        expect(getApply()).not.toBeDisabled();
        expect(screen.queryByTestId("parameter-control-dropdown-error")).not.toBeInTheDocument();
        fireEvent.click(getApply());
        expect(onApply).toHaveBeenCalledWith(100);
    });

    it("mirrors the current value in the preview while the draft is out of range", () => {
        renderDropdown({ value: 25 });
        fireEvent.change(getInput(), { target: { value: "999" } });
        const preview = screen.getByTestId("parameter-control-dropdown-preview");
        expect(preview).toHaveTextContent("25");
        expect(preview).not.toHaveTextContent("999");
    });

    it("renders the preview line with name and current value", () => {
        renderDropdown({ value: 25, name: "Threshold" });
        const preview = screen.getByTestId("parameter-control-dropdown-preview");
        expect(preview).toHaveTextContent("Threshold");
        expect(preview).toHaveTextContent("25");
    });

    it("hides Reset when value equals resetValue", () => {
        renderDropdown({ value: 25, resetValue: 25 });
        expect(screen.queryByTestId("parameter-control-dropdown-reset")).not.toBeInTheDocument();
    });

    it("shows Reset when value differs from resetValue", () => {
        renderDropdown({ value: 50, resetValue: 25 });
        expect(screen.getByTestId("parameter-control-dropdown-reset")).toBeInTheDocument();
    });

    it("hides Reset when resetValue is undefined", () => {
        renderDropdown({ value: 50, resetValue: undefined });
        expect(screen.queryByTestId("parameter-control-dropdown-reset")).not.toBeInTheDocument();
    });

    it("Reset writes resetValue into the draft input but does NOT call onApply", () => {
        const onApply = vi.fn();
        renderDropdown({ value: 50, resetValue: 25, onApply });
        fireEvent.click(screen.getByTestId("parameter-control-dropdown-reset"));
        expect(getInput()).toHaveValue(25);
        expect(onApply).not.toHaveBeenCalled();
    });

    it("Apply commits the post-reset draft value", () => {
        const onApply = vi.fn();
        renderDropdown({ value: 50, resetValue: 25, onApply });
        fireEvent.click(screen.getByTestId("parameter-control-dropdown-reset"));
        fireEvent.click(getApply());
        expect(onApply).toHaveBeenCalledWith(25);
    });

    it("emits the dropdown root data-testid", () => {
        renderDropdown();
        expect(screen.getByTestId("parameter-control-dropdown")).toBeInTheDocument();
    });
});
