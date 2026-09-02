// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntlForTest } from "@gooddata/sdk-ui";

import { StringParameterControlDropdown } from "./StringParameterControlDropdown.js";

const WrappedStringParameterControlDropdown = withIntlForTest(StringParameterControlDropdown);

type CommitModeProps = Extract<
    React.ComponentProps<typeof StringParameterControlDropdown>,
    { mode: "commit" }
>;

const renderDropdown = (props: Partial<CommitModeProps> = {}) => {
    return render(
        <WrappedStringParameterControlDropdown
            name="Scenario"
            value="Actual"
            resetValue="Actual"
            mode="commit"
            onCommit={() => {}}
            onClose={() => {}}
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
    });

    it("shares the parameter-input shell with the numeric variant", () => {
        renderDropdown();
        expect(getInput().parentElement).toHaveClass("gd-ui-kit-parameter-input");
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

    it("Reset writes resetValue into the draft input but does NOT call onCommit", () => {
        const onCommit = vi.fn();
        renderDropdown({ value: "Budget", resetValue: "Actual", onCommit });
        fireEvent.click(screen.getByTestId("parameter-control-dropdown-reset"));
        expect(getInput()).toHaveValue("Actual");
        expect(onCommit).not.toHaveBeenCalled();
    });

    it("Apply commits the post-reset draft value", () => {
        const onCommit = vi.fn();
        renderDropdown({ value: "Budget", resetValue: "Actual", onCommit });
        fireEvent.click(screen.getByTestId("parameter-control-dropdown-reset"));
        fireEvent.click(getApply());
        expect(onCommit).toHaveBeenCalledWith("Actual");
    });

    it("applies any text, including empty, when there are no constraints", () => {
        const onCommit = vi.fn();
        renderDropdown({ onCommit });
        fireEvent.change(getInput(), { target: { value: "" } });
        expect(getApply()).not.toBeDisabled();
        fireEvent.click(getApply());
        expect(onCommit).toHaveBeenCalledWith("");
    });

    it("blocks Apply and shows an error for a draft shorter than minLength", () => {
        const onCommit = vi.fn();
        renderDropdown({ constraints: { minLength: 3 }, onCommit });
        fireEvent.change(getInput(), { target: { value: "ab" } });
        expect(getApply()).toBeDisabled();
        expect(screen.getByTestId("parameter-control-dropdown-error")).toBeInTheDocument();
        fireEvent.click(getApply());
        expect(onCommit).not.toHaveBeenCalled();
    });

    it("does not clamp the input natively so oversized drafts reach validation", () => {
        renderDropdown({ constraints: { maxLength: 6 } });
        expect(getInput()).not.toHaveAttribute("maxLength");
    });

    it("blocks Apply and shows an error for a draft longer than maxLength", () => {
        const onCommit = vi.fn();
        renderDropdown({ constraints: { maxLength: 6 }, onCommit });
        fireEvent.change(getInput(), { target: { value: "Forecast" } });
        expect(getApply()).toBeDisabled();
        expect(screen.getByTestId("parameter-control-dropdown-error")).toBeInTheDocument();
        fireEvent.click(getApply());
        expect(onCommit).not.toHaveBeenCalled();
    });

    it("allows Apply on the inclusive length boundary", () => {
        const onCommit = vi.fn();
        renderDropdown({ constraints: { minLength: 2, maxLength: 6 }, onCommit });
        fireEvent.change(getInput(), { target: { value: "Budget" } });
        expect(getApply()).not.toBeDisabled();
        expect(screen.queryByTestId("parameter-control-dropdown-error")).not.toBeInTheDocument();
        fireEvent.click(getApply());
        expect(onCommit).toHaveBeenCalledWith("Budget");
    });

    it("renders no stepper", () => {
        renderDropdown();
        expect(screen.queryByTestId("parameter-control-dropdown-input-stepper-up")).not.toBeInTheDocument();
        expect(screen.queryByTestId("parameter-control-dropdown-input-stepper-down")).not.toBeInTheDocument();
    });
});
