// (C) 2007-2019 GoodData Corporation
import {
    ITEM_HEIGHT,
    LEGEND_PADDING,
    RESPONSIVE_ITEM_MIN_WIDTH,
    UTF_NON_BREAKING_SPACE,
    calculateFluidLegend,
    calculateStaticLegend,
    getHeatmapLegendConfiguration,
    buildHeatmapLabelsConfig,
    heatmapLegendConfigMatrix,
    heatmapSmallLegendConfigMatrix,
    verticalHeatmapConfig,
    getComboChartSeries,
    LEGEND_AXIS_INDICATOR,
    LEGEND_SEPARATOR,
    groupSeriesItemsByType,
} from "../helpers";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { ISeriesItem } from "../../../Config";

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

    describe("getHeatmapLegendConfiguration", () => {
        const format = "#,##";
        const numericSymbols = ["k", "m", "b", "g"];
        const series = [
            { range: { from: 0, to: 10 }, color: "rgb(255,255,255)", legendIndex: 0 },
            { range: { from: 10, to: 20 }, color: "rgb(0,0,0)", legendIndex: 1 },
            { range: { from: 20, to: 30 }, color: "rgb(0,0,0)", legendIndex: 2 },
            { range: { from: 30, to: 40 }, color: "rgb(0,0,0)", legendIndex: 3 },
            { range: { from: 40, to: 50 }, color: "rgb(0,0,0)", legendIndex: 4 },
            { range: { from: 50, to: 60 }, color: "rgb(0,0,0)", legendIndex: 5 },
            { range: { from: 60, to: 70 }, color: "rgb(0,0,0)", legendIndex: 6 },
        ];
        const seriesForShortening = [
            { range: { from: 99999, to: 100000 }, color: "rgb(255,255,255)", legendIndex: 0 },
            { range: { from: 100000, to: 100001 }, color: "rgb(0,0,0)", legendIndex: 1 },
            { range: { from: 100002, to: 100003 }, color: "rgb(0,0,0)", legendIndex: 2 },
            { range: { from: 100003, to: 100004 }, color: "rgb(0,0,0)", legendIndex: 3 },
            { range: { from: 100004, to: 100005 }, color: "rgb(0,0,0)", legendIndex: 4 },
            { range: { from: 100005, to: 100006 }, color: "rgb(0,0,0)", legendIndex: 5 },
            { range: { from: 100006, to: 100007 }, color: "rgb(0,0,0)", legendIndex: 6 },
        ];
        const labels = [
            { key: "label-0", label: "0", style: { textAlign: "left", width: 30 } },
            { key: "label-1", label: "10", style: { textAlign: "center", width: 40 } },
            { key: "empty-2", label: UTF_NON_BREAKING_SPACE, style: { width: 10 } },
            { key: "label-3", label: "20", style: { textAlign: "center", width: 40 } },
            { key: "empty-4", label: UTF_NON_BREAKING_SPACE, style: { width: 10 } },
            { key: "label-5", label: "30", style: { textAlign: "center", width: 40 } },
            { key: "empty-6", label: UTF_NON_BREAKING_SPACE, style: { width: 10 } },
            { key: "label-7", label: "40", style: { textAlign: "center", width: 40 } },
            { key: "empty-8", label: UTF_NON_BREAKING_SPACE, style: { width: 10 } },
            { key: "label-9", label: "50", style: { textAlign: "center", width: 40 } },
            { key: "empty-10", label: UTF_NON_BREAKING_SPACE, style: { width: 10 } },
            { key: "label-11", label: "60", style: { textAlign: "center", width: 40 } },
            { key: "label-12", label: "70", style: { textAlign: "right", width: 30 } },
        ];
        const labelsSmall = [
            { key: "label-0", label: "0", style: { textAlign: "left", width: 20 } },
            { key: "label-1", label: "10", style: { textAlign: "center", width: 40 } },
            { key: "label-2", label: "20", style: { textAlign: "center", width: 40 } },
            { key: "label-3", label: "30", style: { textAlign: "center", width: 38 } },
            { key: "label-4", label: "40", style: { textAlign: "center", width: 38 } },
            { key: "label-5", label: "50", style: { textAlign: "center", width: 40 } },
            { key: "label-6", label: "60", style: { textAlign: "center", width: 40 } },
            { key: "label-7", label: "70", style: { textAlign: "right", width: 20 } },
        ];
        const boxes = [
            {
                class: null,
                key: "item-0",
                style: { backgroundColor: "rgb(255,255,255)", border: "1px solid #ccc" },
            },
            { class: null, key: "item-1", style: { backgroundColor: "rgb(0,0,0)", border: "none" } },
            { class: null, key: "item-2", style: { backgroundColor: "rgb(0,0,0)", border: "none" } },
            { class: "middle", key: "item-3", style: { backgroundColor: "rgb(0,0,0)", border: "none" } },
            { class: null, key: "item-4", style: { backgroundColor: "rgb(0,0,0)", border: "none" } },
            { class: null, key: "item-5", style: { backgroundColor: "rgb(0,0,0)", border: "none" } },
            { class: null, key: "item-6", style: { backgroundColor: "rgb(0,0,0)", border: "none" } },
        ];

        it("should prepare legend config without shortening when everything fits", () => {
            const expectedResult = {
                classes: ["viz-legend", "heatmap-legend", "position-top", null],
                labels,
                boxes,
                position: "top",
            };
            const result = getHeatmapLegendConfiguration(series, format, numericSymbols, false, "top");

            expect(result).toEqual(expectedResult);
        });

        it("should prepare legend config with position on right, without shortening when everything fits", () => {
            const expectedLabels = [
                { key: "label-0", label: "0", style: { textAlign: "left", height: 15, lineHeight: "11px" } },
                { key: "label-1", label: "10", style: { textAlign: "left", height: 30, lineHeight: "30px" } },
                { key: "label-2", label: "20", style: { textAlign: "left", height: 30, lineHeight: "30px" } },
                { key: "label-3", label: "30", style: { textAlign: "left", height: 30, lineHeight: "30px" } },
                { key: "label-4", label: "40", style: { textAlign: "left", height: 30, lineHeight: "30px" } },
                { key: "label-5", label: "50", style: { textAlign: "left", height: 30, lineHeight: "30px" } },
                { key: "label-6", label: "60", style: { textAlign: "left", height: 30, lineHeight: "30px" } },
                { key: "label-7", label: "70", style: { textAlign: "left", height: 15, lineHeight: "20px" } },
            ];
            const expectedResult = {
                classes: ["viz-legend", "heatmap-legend", "position-right", null],
                labels: expectedLabels,
                boxes,
                position: "right",
            };
            const result = getHeatmapLegendConfiguration(series, format, numericSymbols, false, null);

            expect(result).toEqual(expectedResult);
        });

        it("should prepare small legend config without shortening when everything fits", () => {
            const expectedResult = {
                classes: ["viz-legend", "heatmap-legend", "position-top", "small"],
                labels: labelsSmall,
                boxes,
                position: "top",
            };
            const result = getHeatmapLegendConfiguration(series, format, numericSymbols, true, "top");

            expect(result).toEqual(expectedResult);
        });

        it("should prepare small legend config with bottom position, without shortening when everything fits", () => {
            const expectedResult = {
                classes: ["viz-legend", "heatmap-legend", "position-bottom", "small"],
                labels: labelsSmall,
                boxes,
                position: "bottom",
            };
            const result = getHeatmapLegendConfiguration(series, format, numericSymbols, true, "right");

            expect(result).toEqual(expectedResult);
        });

        it("should prepare legend config with shortening", () => {
            const expectedLabels = [
                { key: "label-0", label: "99999", style: { textAlign: "left", width: 45 } },
                { key: "dots-1", label: "...", style: { textAlign: "center", width: 10 } },
                { key: "label-2", label: "100002", style: { textAlign: "center", width: 90 } },
                { key: "dots-3", label: "...", style: { textAlign: "center", width: 10 } },
                { key: "empty-4", label: " ", style: { width: 40 } },
                { key: "dots-5", label: "...", style: { textAlign: "center", width: 10 } },
                { key: "label-6", label: "100005", style: { textAlign: "center", width: 90 } },
                { key: "dots-7", label: "...", style: { textAlign: "center", width: 10 } },
                { key: "label-8", label: "100007", style: { textAlign: "right", width: 45 } },
            ];
            const expectedResult = {
                classes: ["viz-legend", "heatmap-legend", "position-top", null],
                labels: expectedLabels,
                boxes,
                position: "top",
            };
            const result = getHeatmapLegendConfiguration(
                seriesForShortening,
                format,
                numericSymbols,
                false,
                "top",
            );

            expect(result).toEqual(expectedResult);
        });

        it("should prepare small legend config with shortening", () => {
            const expectedLabels = [
                { key: "label-0", label: "99999", style: { textAlign: "left", width: 35 } },
                { key: "dots-1", label: "...", style: { textAlign: "center", width: 10 } },
                { key: "label-2", label: "100002", style: { textAlign: "center", width: 70 } },
                { key: "dots-3", label: "...", style: { textAlign: "center", width: 10 } },
                { key: "empty-4", label: " ", style: { width: 26 } },
                { key: "dots-5", label: "...", style: { textAlign: "center", width: 10 } },
                { key: "label-6", label: "100005", style: { textAlign: "center", width: 70 } },
                { key: "dots-7", label: "...", style: { textAlign: "center", width: 10 } },
                { key: "label-8", label: "100007", style: { textAlign: "right", width: 35 } },
            ];
            const expectedResult = {
                classes: ["viz-legend", "heatmap-legend", "position-top", "small"],
                labels: expectedLabels,
                boxes,
                position: "top",
            };
            const result = getHeatmapLegendConfiguration(
                seriesForShortening,
                format,
                numericSymbols,
                true,
                "top",
            );

            expect(result).toEqual(expectedResult);
        });

        it("should sum widths to 350", () => {
            const labels = ["0", "1", "2", "3", "4", "5", "6", "7"];

            heatmapLegendConfigMatrix.forEach((config: any) => {
                const elementsConfig = buildHeatmapLabelsConfig(labels, config);

                const width = elementsConfig.reduce((sum: number, item: any) => {
                    return sum + item.style.width;
                }, 0);

                expect(width).toEqual(350);
            });
        });

        it("should sum widths to 276 in small legend", () => {
            const labels = ["0", "1", "2", "3", "4", "5", "6", "7"];

            heatmapSmallLegendConfigMatrix.forEach((config: any) => {
                const elementsConfig = buildHeatmapLabelsConfig(labels, config);

                const width = elementsConfig.reduce((sum: number, item: any) => {
                    return sum + item.style.width;
                }, 0);

                expect(width).toEqual(276);
            });
        });

        it("should sum heights to 210 in vertical legend", () => {
            const labels = ["0", "1", "2", "3", "4", "5", "6", "7"];

            const elementsConfig = buildHeatmapLabelsConfig(labels, verticalHeatmapConfig);

            const width = elementsConfig.reduce((sum: number, item: any) => {
                return sum + item.style.height;
            }, 0);

            expect(width).toEqual(210);
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
