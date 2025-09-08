// (C) 2007-2025 GoodData Corporation

import React from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { LegendSeriesContextStore, VisibilityContext } from "../context.js";
import { ILegendListProps, LegendList } from "../LegendList.js";
import { ISeriesItem, LEGEND_AXIS_INDICATOR, LEGEND_SEPARATOR, isSeriesItemMetric } from "../types.js";

describe("LegendList", () => {
    let onItemClick: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        onItemClick = vi.fn();
    });

    function renderComponent(customProps: Partial<ILegendListProps> = {}) {
        const props: ILegendListProps = {
            enableBorderRadius: false,
            series: [],
            onItemClick,
            ...customProps,
        };

        const mockContextValue = {
            focusedItem: undefined as unknown as ISeriesItem,
            makeItemId: (item?: ISeriesItem) =>
                item && isSeriesItemMetric(item) ? `test-id-${item?.name}` : "test-id",
            descriptionId: "test-description-id",
        };

        // Mock visibility context value for testing
        const mockVisibilityContextValue = {
            registerItem: vi.fn(),
            isVisible: vi.fn().mockReturnValue(true),
            visibleItems: new Set([0, 1, 2, 3, 4, 5]),
        };

        const Wrapped = withIntl(LegendList);

        return render(
            <LegendSeriesContextStore value={mockContextValue}>
                <VisibilityContext.Provider value={mockVisibilityContextValue}>
                    <Wrapped {...props} />
                </VisibilityContext.Provider>
            </LegendSeriesContextStore>,
        );
    }

    it("should render legend items, indicators and separator", () => {
        const series = [
            {
                type: LEGEND_AXIS_INDICATOR,
                labelKey: "left",
            },
            {
                type: "line",
                legendIndex: 0,
                name: "A",
                color: "#333",
                isVisible: true,
                yAxis: 0,
            },
            {
                type: LEGEND_SEPARATOR,
            },
            {
                type: "line",
                legendIndex: 1,
                name: "B",
                color: "#333",
                isVisible: true,
                yAxis: 0,
            },
            {
                type: LEGEND_AXIS_INDICATOR,
                labelKey: "right",
            },
            {
                type: "line",
                legendIndex: 2,
                name: "A",
                color: "#333",
                isVisible: true,
                yAxis: 1,
            },
        ] satisfies ISeriesItem[];

        expect(series).toHaveLength(6);

        renderComponent({ series });

        expect(screen.getAllByTestId("legend-item")).toHaveLength(3);
        expect(screen.getAllByTestId("legend-separator")).toHaveLength(1);
        expect(screen.getAllByTestId("legend-axis-indicator")).toHaveLength(2);
    });

    it("should call onItemClick with the correct item", () => {
        const series = [
            {
                type: "line",
                legendIndex: 0,
                name: "A",
                color: "#333",
                isVisible: true,
            },
            {
                type: "line",
                legendIndex: 1,
                name: "B",
                color: "#444",
                isVisible: true,
            },
        ] satisfies ISeriesItem[];

        renderComponent({ series });

        // Click on the first item
        fireEvent.click(screen.getByText("A"));
        expect(onItemClick).toHaveBeenCalledWith(series[0]);

        // Click on the second item
        fireEvent.click(screen.getByText("B"));
        expect(onItemClick).toHaveBeenCalledWith(series[1]);
    });

    it("should render nothing when series is empty", () => {
        const { container } = renderComponent({ series: [] });
        expect(container.firstChild).toBeNull();
    });
});
