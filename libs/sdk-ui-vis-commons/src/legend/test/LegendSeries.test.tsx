// (C) 2007-2025 GoodData Corporation

import { ComponentProps } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { LegendSeries } from "../LegendSeries.js";
import { ISeriesItem } from "../types.js";

// Mock the visibility detection hook to bypass registration issues
vi.mock("../visibilityDetection.js", () => ({
    useVisibilityDetection: () => ({
        viewportRef: { current: null },
        contextValue: {
            registerItem: () => {}, // No-op in tests
            isVisible: () => true, // All items are visible in tests
            visibleItems: new Set([0, 1, 2]), // Reasonable range for tests
        },
    }),
}));

describe("LegendSeries", () => {
    const DefaultLocale = "en-US";
    const messages = DEFAULT_MESSAGES[DefaultLocale];

    const series: ISeriesItem[] = [
        {
            type: "line",
            name: "Item 1",
            color: "red",
            isVisible: true,
            legendIndex: 0,
        },
        {
            type: "line",
            name: "Item 2",
            color: "blue",
            isVisible: true,
            legendIndex: 1,
        },
        {
            type: "line",
            name: "Item 3",
            color: "green",
            isVisible: false,
            legendIndex: 2,
        },
    ];

    let onToggleItem: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        onToggleItem = vi.fn();
    });

    function createComponent(props: Partial<ComponentProps<typeof LegendSeries>> = {}) {
        return (
            <IntlProvider key={DefaultLocale} locale={DefaultLocale} messages={messages}>
                <LegendSeries series={series} onToggleItem={onToggleItem} {...props}>
                    <div data-testid="legend-children">Legend Children</div>
                </LegendSeries>
            </IntlProvider>
        );
    }
    function renderComponent(props: Partial<ComponentProps<typeof LegendSeries>> = {}) {
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
