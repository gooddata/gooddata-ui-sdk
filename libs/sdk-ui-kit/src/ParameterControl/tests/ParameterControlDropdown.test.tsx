// (C) 2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { ParameterControlDropdown } from "../ParameterControlDropdown.js";

const WrappedParameterControlDropdown = withIntl(ParameterControlDropdown);

const renderDropdown = (props: Partial<React.ComponentProps<typeof ParameterControlDropdown>> = {}) => {
    return render(
        <WrappedParameterControlDropdown
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

const queryInput = (container: HTMLElement) =>
    container.querySelector<HTMLInputElement>('[data-testid="parameter-control-dropdown-input"]')!;

const queryApply = (container: HTMLElement) =>
    container.querySelector<HTMLButtonElement>('[data-testid="parameter-control-dropdown-apply"]')!;

const queryError = (container: HTMLElement) =>
    container.querySelector('[data-testid="parameter-control-dropdown-error"]');

describe("ParameterControlDropdown", () => {
    it("renders the input with the current value", () => {
        const { container } = renderDropdown({ value: 25 });
        expect(queryInput(container).value).toBe("25");
    });

    it("gives the value input an accessible name via the associated label", () => {
        const { container, getByRole } = renderDropdown();
        expect(getByRole("spinbutton", { name: "Value" })).toBe(queryInput(container));
    });

    it("exposes min and max constraints on the input", () => {
        const { container } = renderDropdown();
        const input = queryInput(container);
        expect(input.min).toBe("0");
        expect(input.max).toBe("100");
    });

    it("calls onApply with the numeric value on Apply", () => {
        const onApply = vi.fn();
        const { container } = renderDropdown({ onApply });
        fireEvent.change(queryInput(container), { target: { value: "42" } });
        fireEvent.click(queryApply(container));
        expect(onApply).toHaveBeenCalledWith(42);
    });

    it("calls onCancel without applying when Cancel is clicked", () => {
        const onCancel = vi.fn();
        const onApply = vi.fn();
        const { container } = renderDropdown({ onCancel, onApply });
        fireEvent.change(queryInput(container), { target: { value: "42" } });
        fireEvent.click(
            container.querySelector<HTMLButtonElement>('[data-testid="parameter-control-dropdown-cancel"]')!,
        );
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onApply).not.toHaveBeenCalled();
    });

    it("disables Apply and ignores clicks when input is empty", () => {
        const onApply = vi.fn();
        const { container } = renderDropdown({ onApply });
        fireEvent.change(queryInput(container), { target: { value: "" } });
        const apply = queryApply(container);
        expect(apply.disabled).toBe(true);
        fireEvent.click(apply);
        expect(onApply).not.toHaveBeenCalled();
    });

    it("blocks Apply and shows an error for an out-of-range value", () => {
        const onApply = vi.fn();
        const { container } = renderDropdown({ onApply });
        fireEvent.change(queryInput(container), { target: { value: "999" } });
        const apply = queryApply(container);
        expect(apply.disabled).toBe(true);
        expect(queryError(container)).not.toBeNull();
        fireEvent.click(apply);
        expect(onApply).not.toHaveBeenCalled();
    });

    it("blocks Apply and shows an error for a non-numeric value", () => {
        const onApply = vi.fn();
        const { container } = renderDropdown({ onApply });
        fireEvent.change(queryInput(container), { target: { value: "abc" } });
        const apply = queryApply(container);
        expect(apply.disabled).toBe(true);
        expect(queryError(container)).not.toBeNull();
        fireEvent.click(apply);
        expect(onApply).not.toHaveBeenCalled();
    });

    it("allows Apply on the inclusive boundary and commits the raw value", () => {
        const onApply = vi.fn();
        const { container } = renderDropdown({ value: 100, onApply });
        const apply = queryApply(container);
        expect(apply.disabled).toBe(false);
        expect(queryError(container)).toBeNull();
        fireEvent.click(apply);
        expect(onApply).toHaveBeenCalledWith(100);
    });

    it("mirrors the current value in the preview while the draft is out of range", () => {
        const { container } = renderDropdown({ value: 25 });
        fireEvent.change(queryInput(container), { target: { value: "999" } });
        const preview = container.querySelector('[data-testid="parameter-control-dropdown-preview"]')!;
        expect(preview.textContent).toContain("25");
        expect(preview.textContent).not.toContain("999");
    });

    it("renders the preview line with name and current value", () => {
        const { container } = renderDropdown({ value: 25, name: "Threshold" });
        const preview = container.querySelector('[data-testid="parameter-control-dropdown-preview"]')!;
        expect(preview.textContent).toContain("Threshold");
        expect(preview.textContent).toContain("25");
    });

    it("hides Reset when value equals resetValue", () => {
        const { container } = renderDropdown({ value: 25, resetValue: 25 });
        expect(container.querySelector('[data-testid="parameter-control-dropdown-reset"]')).toBeNull();
    });

    it("shows Reset when value differs from resetValue", () => {
        const { container } = renderDropdown({ value: 50, resetValue: 25 });
        expect(container.querySelector('[data-testid="parameter-control-dropdown-reset"]')).not.toBeNull();
    });

    it("hides Reset when resetValue is undefined", () => {
        const { container } = renderDropdown({ value: 50, resetValue: undefined });
        expect(container.querySelector('[data-testid="parameter-control-dropdown-reset"]')).toBeNull();
    });

    it("Reset writes resetValue into the draft input but does NOT call onApply", () => {
        const onApply = vi.fn();
        const { container } = renderDropdown({ value: 50, resetValue: 25, onApply });
        fireEvent.click(
            container.querySelector<HTMLButtonElement>('[data-testid="parameter-control-dropdown-reset"]')!,
        );
        expect(queryInput(container).value).toBe("25");
        expect(onApply).not.toHaveBeenCalled();
    });

    it("Apply commits the post-reset draft value", () => {
        const onApply = vi.fn();
        const { container } = renderDropdown({ value: 50, resetValue: 25, onApply });
        fireEvent.click(
            container.querySelector<HTMLButtonElement>('[data-testid="parameter-control-dropdown-reset"]')!,
        );
        fireEvent.click(queryApply(container));
        expect(onApply).toHaveBeenCalledWith(25);
    });

    it("emits the dropdown root data-testid", () => {
        const { container } = renderDropdown();
        expect(container.querySelector('[data-testid="parameter-control-dropdown"]')).not.toBeNull();
    });
});
