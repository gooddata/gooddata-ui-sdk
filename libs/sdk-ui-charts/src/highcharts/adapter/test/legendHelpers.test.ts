// (C) 2007-2021 GoodData Corporation
import {
    ITEM_HEIGHT,
    LEGEND_PADDING,
    RESPONSIVE_ITEM_MIN_WIDTH,
    calculateFluidLegend,
    calculateStaticLegend,
    getComboChartSeries,
    LEGEND_AXIS_INDICATOR,
    LEGEND_SEPARATOR,
    groupSeriesItemsByType,
} from "../legendHelpers.js";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { ISeriesItem } from "../../typings/unsafe.js";
import { describe, it, expect } from "vitest";

describe("helpers", () => {
    describe("calculateFluidLegend", () => {
        describe("2 columns layout", () => {
            const containerWidth = 500;

            it("should show 4 items with paging for 10 series", () => {
                const { hasPaging, visibleItemsCount } = calculateFluidLegend(10, containerWidth);
                expect(hasPaging).toEqual(true);
                expect(visibleItemsCount).toEqual(4);
            });

            it("should show 4 items without paging for 4 series", () => {
                const { hasPaging, visibleItemsCount } = calculateFluidLegend(4, containerWidth);
                expect(hasPaging).toEqual(false);
                expect(visibleItemsCount).toEqual(4);
            });
        });

        describe("3 columns layout", () => {
            const containerWidth = 700;

            it("should show 6 items with paging for 10 series", () => {
                const { hasPaging, visibleItemsCount } = calculateFluidLegend(10, containerWidth);
                expect(hasPaging).toEqual(true);
                expect(visibleItemsCount).toEqual(6);
            });

            it("should show 6 items without paging for 6 series", () => {
                const { hasPaging, visibleItemsCount } = calculateFluidLegend(6, containerWidth);
                expect(hasPaging).toEqual(false);
                expect(visibleItemsCount).toEqual(6);
            });
        });

        describe("overlapping columns", () => {
            const containerWidth = 3 * RESPONSIVE_ITEM_MIN_WIDTH + 1 + 2 * LEGEND_PADDING;

            it("should not show paging for 5 items", () => {
                const { hasPaging, visibleItemsCount } = calculateFluidLegend(6, containerWidth);
                expect(hasPaging).toEqual(false);
                expect(visibleItemsCount).toEqual(6);
            });

            it("should show paging for 7 items", () => {
                const { hasPaging, visibleItemsCount } = calculateFluidLegend(7, containerWidth);
                expect(hasPaging).toEqual(true);
                expect(visibleItemsCount).toEqual(4);
            });
        });
    });

    describe("calculateStaticLegend", () => {
        it("should show paging if needed", () => {
            const itemsCount = 10;
            const containerHeight = itemsCount * ITEM_HEIGHT;
            let legendObj = calculateStaticLegend(itemsCount, containerHeight);

            expect(legendObj.hasPaging).toEqual(false);
            expect(legendObj.visibleItemsCount).toEqual(10);

            legendObj = calculateStaticLegend(itemsCount, containerHeight - ITEM_HEIGHT);

            expect(legendObj.hasPaging).toEqual(true);
            expect(legendObj.visibleItemsCount).toEqual(6);
        });
    });

    describe("groupSeriesItemsByType", () => {
        it("should group items which are having same chart type", () => {
            const { COLUMN, LINE } = VisualizationTypes;
            const series: ISeriesItem[] = [
                { type: COLUMN, yAxis: 0, legendIndex: 0 },
                { type: LINE, yAxis: 1, legendIndex: 2 },
                { type: COLUMN, yAxis: 0, legendIndex: 1 },
            ];

            expect(groupSeriesItemsByType(series)).toEqual({
                primaryItems: [series[0], series[2]],
                secondaryItems: [series[1]],
            });
        });

        it("should return empty groups when there is no series item", () => {
            expect(groupSeriesItemsByType([])).toEqual({
                primaryItems: [],
                secondaryItems: [],
            });
        });
    });

    describe("getComboChartSeries", () => {
        const { COLUMN, LINE, COMBO } = VisualizationTypes;

        it("should indicate which measure belongs to Column(Left) and Line(Right)", () => {
            const series: ISeriesItem[] = [
                { type: COLUMN, yAxis: 0, legendIndex: 0 },
                { type: LINE, yAxis: 1, legendIndex: 1 },
            ];

            expect(getComboChartSeries(series)).toEqual([
                { type: LEGEND_AXIS_INDICATOR, labelKey: COMBO, data: [COLUMN, "left"] },
                series[0],
                { type: LEGEND_SEPARATOR },
                { type: LEGEND_AXIS_INDICATOR, labelKey: COMBO, data: [LINE, "right"] },
                series[1],
            ]);
        });

        it("should indicate which chart type of each measure when dual axis is off", () => {
            const series: ISeriesItem[] = [
                { type: COLUMN, yAxis: 0, legendIndex: 0 },
                { type: LINE, yAxis: 0, legendIndex: 1 },
            ];

            expect(getComboChartSeries(series)).toEqual([
                { type: LEGEND_AXIS_INDICATOR, labelKey: COLUMN },
                series[0],
                { type: LEGEND_SEPARATOR },
                { type: LEGEND_AXIS_INDICATOR, labelKey: LINE },
                series[1],
            ]);
        });

        it("should transform to dual axis series when all measures have same chart type", () => {
            const series: ISeriesItem[] = [
                { type: COLUMN, yAxis: 0, legendIndex: 0 },
                { type: COLUMN, yAxis: 1, legendIndex: 1 },
            ];

            expect(getComboChartSeries(series)).toEqual([
                { type: LEGEND_AXIS_INDICATOR, labelKey: "left" },
                series[0],
                { type: LEGEND_SEPARATOR },
                { type: LEGEND_AXIS_INDICATOR, labelKey: "right" },
                series[1],
            ]);
        });
    });
});
