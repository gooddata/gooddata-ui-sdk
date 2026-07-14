// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { StringParameterControlDropdown } from "../StringParameterControlDropdown.js";

const WrappedStringParameterControlDropdown = withIntl(StringParameterControlDropdown);

const renderDropdown = (props: Partial<React.ComponentProps<typeof StringParameterControlDropdown>> = {}) => {
    return render(
        <WrappedStringParameterControlDropdown
            name="Scenario"
            value="Actual"
            resetValue="Actual"
            onApply={() => {}}
            onCancel={() => {}}
            {...props}
        />,
    );
};

const getInput = () => screen.getByTestId("parameter-control-dropdown-input");
const getApply = () => screen.getByTestId("parameter-control-dropdown-apply");

describe("StringParameterControlDropdown", () => {
    it("renders a free-text input with the current value", () => {
        renderDropdown({ value: "Actual" });
        expect(getInput()).toHaveValue("Actual");
        expect(getInput()).toHaveProperty("type", "text");
    });

    it("calls onApply with the typed text on Apply", () => {
        const onApply = vi.fn();
        renderDropdown({ onApply });
        fireEvent.change(getInput(), { target: { value: "Budget" } });
        fireEvent.click(getApply());
        expect(onApply).toHaveBeenCalledWith("Budget");
    });

    it("calls onCancel without applying when Cancel is clicked", () => {
        const onCancel = vi.fn();
        const onApply = vi.fn();
        renderDropdown({ onCancel, onApply });
        fireEvent.change(getInput(), { target: { value: "Budget" } });
        fireEvent.click(screen.getByTestId("parameter-control-dropdown-cancel"));
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onApply).not.toHaveBeenCalled();
    });

    it("hides Reset when value equals resetValue", () => {
        renderDropdown({ value: "Actual", resetValue: "Actual" });
        expect(screen.queryByTestId("parameter-control-dropdown-reset")).not.toBeInTheDocument();
    });

    it("hides Reset when resetValue is undefined", () => {
        renderDropdown({ value: "Budget", resetValue: undefined });
        expect(screen.queryByTestId("parameter-control-dropdown-reset")).not.toBeInTheDocument();
    });

    it("shows Reset when value differs from resetValue", () => {
        renderDropdown({ value: "Budget", resetValue: "Actual" });
        expect(screen.getByTestId("parameter-control-dropdown-reset")).toBeInTheDocument();
    });

    it("Reset writes resetValue into the draft input but does NOT call onApply", () => {
        const onApply = vi.fn();
        renderDropdown({ value: "Budget", resetValue: "Actual", onApply });
        fireEvent.click(screen.getByTestId("parameter-control-dropdown-reset"));
        expect(getInput()).toHaveValue("Actual");
        expect(onApply).not.toHaveBeenCalled();
    });

    it("Apply commits the post-reset draft value", () => {
        const onApply = vi.fn();
        renderDropdown({ value: "Budget", resetValue: "Actual", onApply });
        fireEvent.click(screen.getByTestId("parameter-control-dropdown-reset"));
        fireEvent.click(getApply());
        expect(onApply).toHaveBeenCalledWith("Actual");
    });

    it("applies any text, including empty, when there are no constraints", () => {
        const onApply = vi.fn();
        renderDropdown({ onApply });
        fireEvent.change(getInput(), { target: { value: "" } });
        expect(getApply()).not.toBeDisabled();
        fireEvent.click(getApply());
        expect(onApply).toHaveBeenCalledWith("");
    });

    it("blocks Apply and shows an error for a draft shorter than minLength", () => {
        const onApply = vi.fn();
        renderDropdown({ constraints: { minLength: 3 }, onApply });
        fireEvent.change(getInput(), { target: { value: "ab" } });
        expect(getApply()).toBeDisabled();
        expect(screen.getByTestId("parameter-control-dropdown-error")).toBeInTheDocument();
        fireEvent.click(getApply());
        expect(onApply).not.toHaveBeenCalled();
    });

    it("does not clamp the input natively so oversized drafts reach validation", () => {
        renderDropdown({ constraints: { maxLength: 6 } });
        expect(getInput()).not.toHaveAttribute("maxLength");
    });

    it("blocks Apply and shows an error for a draft longer than maxLength", () => {
        const onApply = vi.fn();
        renderDropdown({ constraints: { maxLength: 6 }, onApply });
        fireEvent.change(getInput(), { target: { value: "Forecast" } });
        expect(getApply()).toBeDisabled();
        expect(screen.getByTestId("parameter-control-dropdown-error")).toBeInTheDocument();
        fireEvent.click(getApply());
        expect(onApply).not.toHaveBeenCalled();
    });

    it("allows Apply on the inclusive length boundary", () => {
        const onApply = vi.fn();
        renderDropdown({ constraints: { minLength: 2, maxLength: 6 }, onApply });
        fireEvent.change(getInput(), { target: { value: "Budget" } });
        expect(getApply()).not.toBeDisabled();
        expect(screen.queryByTestId("parameter-control-dropdown-error")).not.toBeInTheDocument();
        fireEvent.click(getApply());
        expect(onApply).toHaveBeenCalledWith("Budget");
    });

    it("mirrors the current value in the preview while the draft is invalid", () => {
        renderDropdown({ value: "Actual", constraints: { maxLength: 6 } });
        fireEvent.change(getInput(), { target: { value: "Forecast" } });
        const preview = screen.getByTestId("parameter-control-dropdown-preview");
        expect(preview).toHaveTextContent("Actual");
        expect(preview).not.toHaveTextContent("Forecast");
    });
});
