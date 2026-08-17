// (C) 2019-2026 GoodData Corporation

import { act, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";
import { CheckboxControl, type ICheckboxControlProps } from "../CheckboxControl.js";

describe("CheckboxControl", () => {
    // BubbleHoverTrigger schedules the bubble with a window.setTimeout of SHOW_DELAY (425ms).
    // Waiting for it with real timers is what made the tooltip test slow, so the test below
    // drives that timer with fake timers instead.
    const BUBBLE_SHOW_DELAY = 425;

    afterEach(() => {
        vi.useRealTimers();
    });

    const defaultProps = {
        valuePath: "path",
        labelText: "properties.canvas.gridline",
        properties: {},
        propertiesMeta: {},
        pushData: () => {},
    };

    function createComponent(customProps: Partial<ICheckboxControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return render(
            <InternalIntlWrapper>
                <CheckboxControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    it("should render checkbox control", () => {
        createComponent();
        expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("should be unchecked by default", () => {
        createComponent();
        expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("should be enabled by default", () => {
        createComponent();
        expect(screen.getByRole("checkbox")).toBeEnabled();
    });

    it("should render checked checkbox", () => {
        createComponent({ checked: true });
        expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("should render disabled checkbox", () => {
        createComponent({ disabled: true });
        expect(screen.getByRole("checkbox")).toBeDisabled();
    });

    it("should display tooltip message when configured", () => {
        vi.useFakeTimers();

        createComponent({ disabled: true, showDisabledMessage: true });
        fireEvent.mouseOver(screen.getByRole("checkbox"));

        act(() => {
            vi.advanceTimersByTime(BUBBLE_SHOW_DELAY);
        });

        expect(
            screen.getByText("Property is not applicable for this configuration of the visualization"),
        ).toBeInTheDocument();
    });

    it("should call pushData when checkbox value changes", async () => {
        const pushData = vi.fn();
        createComponent({
            properties: {},
            pushData,
        });

        await act(() => userEvent.click(screen.getByRole("checkbox")));
        expect(pushData).toHaveBeenCalledTimes(1);
    });
});
