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
const getStepperUp = () => screen.getByTestId("parameter-control-dropdown-input-stepper-up");
const getStepperDown = () => screen.getByTestId("parameter-control-dropdown-input-stepper-down");

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
        expect(getInput()).not.toHaveAttribute("step");
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

    it("increments the draft with the native number input when the up stepper is clicked", () => {
        renderDropdown({ value: 25 });
        fireEvent.click(getStepperUp());
        expect(getInput()).toHaveValue(26);
    });

    it("decrements the draft by 1 when the down stepper is clicked", () => {
        renderDropdown({ value: 25 });
        fireEvent.click(getStepperDown());
        expect(getInput()).toHaveValue(24);
    });

    it("snaps a fractional draft up to the next whole step", () => {
        renderDropdown();
        fireEvent.change(getInput(), { target: { value: "25.5" } });
        fireEvent.click(getStepperUp());
        expect(getInput()).toHaveValue(26);
    });

    it("clamps the stepped value to the max bound", () => {
        renderDropdown({ value: 99.5 });
        fireEvent.click(getStepperUp());
        expect(getInput()).toHaveValue(100);
        expect(getStepperUp()).toBeDisabled();
    });

    it("snaps a fractional draft down to the next whole step", () => {
        renderDropdown();
        fireEvent.change(getInput(), { target: { value: "25.5" } });
        fireEvent.click(getStepperDown());
        expect(getInput()).toHaveValue(25);
    });

    it("keeps the draft unchanged when no whole step fits below max", () => {
        renderDropdown({ value: 0, constraints: { min: 0, max: 0.5 } });
        fireEvent.click(getStepperUp());
        expect(getInput()).toHaveValue(0);
        expect(getStepperUp()).not.toBeDisabled();
    });

    it("steps a fractional draft down to min", () => {
        renderDropdown({ value: 0.5, constraints: { min: 0, max: 0.5 } });
        fireEvent.click(getStepperDown());
        expect(getInput()).toHaveValue(0);
        expect(getStepperDown()).toBeDisabled();
    });

    it("disables the up stepper when the draft is at max", () => {
        renderDropdown({ value: 100 });
        expect(getStepperUp()).toBeDisabled();
        expect(getStepperDown()).not.toBeDisabled();
    });

    it("disables the down stepper when the draft is at min", () => {
        renderDropdown({ value: 0 });
        expect(getStepperDown()).toBeDisabled();
        expect(getStepperUp()).not.toBeDisabled();
    });

    it("keeps focus on the input when pointer activation steps", () => {
        renderDropdown({ value: 25 });
        const input = getInput();
        input.focus();
        fireEvent.mouseDown(getStepperUp());
        fireEvent.click(getStepperUp());
        expect(getInput()).toHaveValue(26);
        expect(input).toHaveFocus();
    });

    it("exposes named step controls that reference the input", () => {
        renderDropdown({ inputId: "threshold-input" });
        const increment = screen.getByRole("button", { name: "Increase value" });
        const decrement = screen.getByRole("button", { name: "Decrease value" });
        expect(increment).toHaveAttribute("aria-controls", "threshold-input");
        expect(decrement).toHaveAttribute("aria-controls", "threshold-input");
        expect(increment).toHaveAttribute("tabindex", "-1");
        expect(decrement).toHaveAttribute("tabindex", "-1");
    });

    it("associates validation errors with the numeric input", () => {
        renderDropdown();
        const compoundInput = getInput().parentElement;
        expect(compoundInput).toHaveClass("gd-ui-kit-parameter-input");
        fireEvent.change(getInput(), { target: { value: "999" } });
        expect(getInput()).toBeInvalid();
        expect(getInput()).toHaveErrorMessage("Value is out of range. Enter a value between 0 and 100.");
        expect(getInput()).toHaveAccessibleDescription(
            "Value is out of range. Enter a value between 0 and 100.",
        );
        expect(compoundInput).toHaveClass("gd-ui-kit-parameter-input--hasError");
    });
});
