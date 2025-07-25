// (C) 2007-2025 GoodData Corporation
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { LegendSeries } from "../LegendSeries.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ISeriesItem } from "../types.js";
import { IntlProvider } from "react-intl";
import { messagesMap, pickCorrectWording } from "@gooddata/sdk-ui";

describe("LegendSeries", () => {
    // Define locale and messages
    const DefaultLocale = "en-US";
    const messages = pickCorrectWording(messagesMap[DefaultLocale], {
        workspace: "mockWorkspace",
        enableRenamingMeasureToMetric: true,
    });

    const series: ISeriesItem[] = [
        {
            name: "Item 1",
            color: "red",
            isVisible: true,
        },
        {
            name: "Item 2",
            color: "blue",
            isVisible: true,
        },
        {
            name: "Item 3",
            color: "green",
            isVisible: false,
        },
    ];

    let onToggleItem: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        onToggleItem = vi.fn();
    });

    function createComponent(props: Partial<React.ComponentProps<typeof LegendSeries>> = {}) {
        return (
            <IntlProvider key={DefaultLocale} locale={DefaultLocale} messages={messages}>
                <LegendSeries series={series} onToggleItem={onToggleItem} {...props}>
                    <div data-testid="legend-children">Legend Children</div>
                </LegendSeries>
            </IntlProvider>
        );
    }
    function renderComponent(props: Partial<React.ComponentProps<typeof LegendSeries>> = {}) {
        return render(createComponent(props));
    }

    it("should render children", () => {
        renderComponent();
        expect(screen.getByTestId("legend-children")).toBeInTheDocument();
    });

    it("should render with correct accessibility attributes", () => {
        renderComponent();

        const wrapper = screen.getByRole("group");
        expect(wrapper).toBeInTheDocument();

        const list = screen.getByRole("list");
        expect(list).toBeInTheDocument();

        // Check for screen reader text
        expect(screen.getByRole("presentation")).toBeInTheDocument();
    });

    it("should use provided label", () => {
        renderComponent({ label: "Custom Label" });

        const list = screen.getByRole("list");
        expect(list).toHaveAttribute("aria-label", expect.stringContaining("Custom Label"));
    });

    it("should apply custom style", () => {
        const customStyle = { backgroundColor: "yellow" };
        renderComponent({ style: customStyle });

        const list = screen.getByRole("list");
        expect(list).toHaveStyle(customStyle);
    });

    it("should apply custom className", () => {
        renderComponent({ className: "custom-class" });

        const wrapper = screen.getByRole("group");
        expect(wrapper).toHaveClass("custom-class");
    });

    it("should handle keyboard navigation", () => {
        renderComponent();

        const wrapper = screen.getByRole("group");

        // Initial focus is on first item
        expect(wrapper).toHaveAttribute("aria-activedescendant");

        // Arrow down should move to next item
        fireEvent.keyDown(wrapper, { code: "ArrowDown" });
        expect(onToggleItem).not.toHaveBeenCalled();

        // Enter should toggle the focused item
        fireEvent.keyDown(wrapper, { code: "Enter" });
        expect(onToggleItem).toHaveBeenCalledWith(series[1]);

        // Home should move to first item
        fireEvent.keyDown(wrapper, { code: "Home" });
        fireEvent.keyDown(wrapper, { code: "Enter" });
        expect(onToggleItem).toHaveBeenCalledWith(series[0]);

        // End should move to last item
        fireEvent.keyDown(wrapper, { code: "End" });
        fireEvent.keyDown(wrapper, { code: "Enter" });
        expect(onToggleItem).toHaveBeenCalledWith(series[2]);

        // Arrow up should move to previous item
        fireEvent.keyDown(wrapper, { code: "ArrowUp" });
        fireEvent.keyDown(wrapper, { code: "Enter" });
        expect(onToggleItem).toHaveBeenCalledWith(series[1]);
    });

    it("should reset focused index when series length changes", () => {
        const { rerender } = renderComponent();

        const wrapper = screen.getByRole("group");

        // Move focus to second item
        fireEvent.keyDown(wrapper, { code: "ArrowDown" });

        // Change series length
        const newSeries = [series[0]];
        rerender(createComponent({ series: newSeries }));

        // Focus should be reset to first item
        fireEvent.keyDown(wrapper, { code: "Enter" });
        expect(onToggleItem).toHaveBeenCalledWith(newSeries[0]);
    });

    it("should handle circular navigation", () => {
        renderComponent();

        const wrapper = screen.getByRole("group");

        // Move to last item
        fireEvent.keyDown(wrapper, { code: "End" });

        // Arrow down should wrap to first item
        fireEvent.keyDown(wrapper, { code: "ArrowDown" });
        fireEvent.keyDown(wrapper, { code: "Enter" });
        expect(onToggleItem).toHaveBeenCalledWith(series[0]);

        // Move to first item
        fireEvent.keyDown(wrapper, { code: "Home" });

        // Arrow up should wrap to last item
        fireEvent.keyDown(wrapper, { code: "ArrowUp" });
        fireEvent.keyDown(wrapper, { code: "Enter" });
        expect(onToggleItem).toHaveBeenCalledWith(series[2]);
    });
});
