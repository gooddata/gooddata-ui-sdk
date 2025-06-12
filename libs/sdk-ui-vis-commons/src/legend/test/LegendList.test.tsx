// (C) 2007-2025 GoodData Corporation
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ILegendListProps, LegendList } from "../LegendList.js";
import { withIntl } from "@gooddata/sdk-ui";
import { LEGEND_AXIS_INDICATOR, LEGEND_SEPARATOR } from "../helpers.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ISeriesItem } from "../types.js";
import { LegendSeriesContextStore } from "../context.js";

describe("LegendList", () => {
    let onItemClick: jest.Mock;

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
            focusedItem: undefined,
            makeItemId: (item: ISeriesItem) => `test-id-${item?.name}`,
            descriptionId: "test-description-id",
        };

        const Wrapped = withIntl(LegendList);

        return render(
            <LegendSeriesContextStore value={mockContextValue}>
                <Wrapped {...props} />
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
                name: "A",
                color: "#333",
                isVisible: true,
                yAxis: 0,
            },
            {
                type: LEGEND_SEPARATOR,
            },
            {
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
                name: "A",
                color: "#333",
                isVisible: true,
                yAxis: 1,
            },
        ];

        expect(series).toHaveLength(6);

        renderComponent({ series });

        expect(screen.getAllByTestId("legend-item")).toHaveLength(3);
        expect(screen.getAllByLabelText("Legend separator")).toHaveLength(1);
        expect(screen.getAllByTestId("legend-axis-indicator")).toHaveLength(2);
    });

    it("should call onItemClick with the correct item", () => {
        const series = [
            {
                name: "A",
                color: "#333",
                isVisible: true,
            },
            {
                name: "B",
                color: "#444",
                isVisible: true,
            },
        ];

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
