// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IMeasureGroupDescriptor } from "@gooddata/sdk-model";

import { type IChartConfig } from "../../../../interfaces/index.js";
import { type IChartOptions } from "../../../typings/unsafe.js";
import { setupDistinctPointShapesToSeries } from "../chartDistinctPointShapes.js";

describe("setupDistinctPointShapesToSeries", () => {
    const mockChartOptions: IChartOptions = {
        type: "line",
        stacking: null,
        data: {
            series: [],
            categories: [],
        },
    };

    const mockSeriesData: any[] = [
        {
            name: "Revenue",
            type: "line",
            data: [{ y: 100 }, { y: 200 }, { y: 150 }],
            color: "#FF6B6B",
            measureIdentifier: "revenue_metric",
        },
        {
            name: "Profit",
            type: "line",
            data: [{ y: 50 }, { y: 80 }, { y: 60 }],
            color: "#4ECDC4",
            measureIdentifier: "profit_metric",
        },
        {
            name: "Cost",
            type: "line",
            data: [{ y: 50 }, { y: 120 }, { y: 90 }],
            color: "#45B7D1",
            measureIdentifier: "cost_metric",
        },
    ];

    const mockMeasureGroup: IMeasureGroupDescriptor["measureGroupHeader"] = {
        items: [
            {
                measureHeaderItem: {
                    name: "Revenue",
                    localIdentifier: "revenue_metric",
                    format: "#,##0",
                    uri: "/gdc/md/mockproject/obj/123",
                },
            },
            {
                measureHeaderItem: {
                    name: "Profit",
                    localIdentifier: "profit_metric",
                    format: "#,##0",
                    uri: "/gdc/md/mockproject/obj/456",
                },
            },
            {
                measureHeaderItem: {
                    name: "Cost",
                    localIdentifier: "cost_metric",
                    format: "#,##0",
                    uri: "/gdc/md/mockproject/obj/789",
                },
            },
        ],
    };

    describe("when distinctPointShapes is disabled", () => {
        it("should return empty object when distinctPointShapes is not enabled", () => {
            const config: IChartConfig = {
                distinctPointShapes: { enabled: false },
            };

            const result = setupDistinctPointShapesToSeries(
                mockChartOptions.type,
                mockSeriesData,
                config,
                mockMeasureGroup,
            );

            expect(result).toEqual(mockSeriesData);
        });

        it("should return empty object when distinctPointShapes is undefined", () => {
            const config: IChartConfig = {};

            const result = setupDistinctPointShapesToSeries(
                mockChartOptions.type,
                mockSeriesData,
                config,
                mockMeasureGroup,
            );

            expect(result).toEqual(mockSeriesData);
        });

        it("should return empty object when dataPoints are hidden", () => {
            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
                dataPoints: { visible: false },
            };

            const result = setupDistinctPointShapesToSeries(
                mockChartOptions.type,
                mockSeriesData,
                config,
                mockMeasureGroup,
            );

            expect(result).toEqual(mockSeriesData);
        });
    });

    describe("chart type support", () => {
        it("should return unchanged series for unsupported chart types", () => {
            const barChartOptions: IChartOptions = {
                ...mockChartOptions,
                type: "column",
            };

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = setupDistinctPointShapesToSeries(
                barChartOptions.type,
                mockSeriesData,
                config,
                mockMeasureGroup,
            );

            expect(result).toEqual(mockSeriesData);
        });

        it("should support line charts", () => {
            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = setupDistinctPointShapesToSeries(
                mockChartOptions.type,
                mockSeriesData,
                config,
                mockMeasureGroup,
            );

            expect(result).toBeDefined();
            expect(result).toHaveLength(3);
        });

        it("should support area charts", () => {
            const areaChartOptions: IChartOptions = {
                ...mockChartOptions,
                type: "area",
            };

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = setupDistinctPointShapesToSeries(
                areaChartOptions.type,
                mockSeriesData,
                config,
                mockMeasureGroup,
            );

            expect(result).toBeDefined();
            expect(result).toHaveLength(3);
        });

        it("should support combo charts with line types", () => {
            const comboChartOptions: IChartOptions = {
                ...mockChartOptions,
                type: "combo",
            };

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
                primaryChartType: "line",
            };

            const result = setupDistinctPointShapesToSeries(
                comboChartOptions.type,
                mockSeriesData,
                config,
                mockMeasureGroup,
            );

            expect(result).toBeDefined();
            expect(result).toHaveLength(3);
        });

        it("should not support combo charts without line types", () => {
            const comboChartOptions: IChartOptions = {
                ...mockChartOptions,
                type: "combo",
            };

            const mockSeriesData: any[] = [
                {
                    name: "Revenue",
                    type: "column",
                    data: [{ y: 100 }, { y: 200 }, { y: 150 }],
                    color: "#FF6B6B",
                    measureIdentifier: "revenue_metric",
                },
                {
                    name: "Profit",
                    type: "area",
                    data: [{ y: 50 }, { y: 80 }, { y: 60 }],
                    color: "#4ECDC4",
                    measureIdentifier: "profit_metric",
                },
                {
                    name: "Cost",
                    type: "column",
                    data: [{ y: 50 }, { y: 120 }, { y: 90 }],
                    color: "#45B7D1",
                    measureIdentifier: "cost_metric",
                },
            ];

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
                primaryChartType: "column",
                secondaryChartType: "column",
            };

            const result = setupDistinctPointShapesToSeries(
                comboChartOptions.type,
                mockSeriesData,
                config,
                mockMeasureGroup,
            );

            expect(result).toEqual(mockSeriesData);
        });
    });

    describe("automatic shape assignment", () => {
        it("should assign shapes in sequence from POINT_SHAPES_CONFIGS", () => {
            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = setupDistinctPointShapesToSeries(
                mockChartOptions.type,
                mockSeriesData,
                config,
                mockMeasureGroup,
            );

            const expectedShapes = ["circle", "square", "triangle"];
            const series = result as any[];

            expect(series[0].marker.symbol).toBe(expectedShapes[0]);
            expect(series[0].pointShape).toBe(expectedShapes[0]);

            expect(series[1].marker.symbol).toBe(expectedShapes[1]);
            expect(series[1].pointShape).toBe(expectedShapes[1]);

            expect(series[2].marker.symbol).toBe(expectedShapes[2]);
            expect(series[2].pointShape).toBe(expectedShapes[2]);
        });

        it("should cycle through shapes when more series than available shapes", () => {
            const extendedSeriesData: any[] = [
                ...mockSeriesData,
                {
                    name: "Margin",
                    type: "line",
                    data: [{ y: 10 }, { y: 20 }, { y: 15 }],
                    color: "#FFA07A",
                    measureIdentifier: "margin_metric",
                },
                {
                    name: "Target",
                    type: "line",
                    data: [{ y: 120 }, { y: 180 }, { y: 140 }],
                    color: "#98D8C8",
                    measureIdentifier: "target_metric",
                },
                {
                    name: "Forecast",
                    type: "line",
                    data: [{ y: 110 }, { y: 190 }, { y: 160 }],
                    color: "#F7DC6F",
                    measureIdentifier: "forecast_metric",
                },
            ];

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = setupDistinctPointShapesToSeries(
                mockChartOptions.type,
                extendedSeriesData,
                config,
                mockMeasureGroup,
            );

            // Should cycle back to the beginning
            const series = result as any[];
            expect(series[5].marker.symbol).toBe("circle"); // 6th series gets first shape again
        });

        it("should preserve existing marker properties", () => {
            const seriesWithMarkers: any[] = [
                {
                    ...mockSeriesData[0],
                    marker: {
                        enabled: true,
                        radius: 5,
                        lineWidth: 2,
                    },
                },
            ];

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = setupDistinctPointShapesToSeries(
                mockChartOptions.type,
                seriesWithMarkers,
                config,
                mockMeasureGroup,
            );

            const series = result as any[];

            expect(series[0].marker).toEqual({
                enabled: true,
                radius: 5,
                lineWidth: 2,
                symbol: "circle",
            });
        });
    });

    describe("series type filtering", () => {
        it("should only apply shapes to line series", () => {
            const mixedSeriesData: any[] = [
                {
                    name: "Line Series",
                    type: "line",
                    data: [{ y: 100 }],
                    measureIdentifier: "line_metric",
                },
                {
                    name: "Column Series",
                    type: "column",
                    data: [{ y: 200 }],
                    measureIdentifier: "column_metric",
                },
                {
                    name: "Area Series",
                    type: "area",
                    data: [{ y: 150 }],
                    measureIdentifier: "area_metric",
                },
            ];

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = setupDistinctPointShapesToSeries(
                mockChartOptions.type,
                mixedSeriesData,
                config,
                mockMeasureGroup,
            );

            const series = result as any[];

            // Line series (index 0) should have marker with first shape
            expect(series[0].marker.symbol).toBe("circle");
            expect(series[0].pointShape).toBe("circle");

            // Column series (index 1) should not have marker changes
            expect(series[1].marker).toBeUndefined();
            expect(series[1].pointShape).toBeUndefined();

            // Area series (index 2) should not have marker changes
            expect(series[2].marker).toBeUndefined();
            expect(series[2].pointShape).toBeUndefined();
        });

        it("should apply shapes to series with no type (defaults to line)", () => {
            const seriesWithoutType: any[] = [
                {
                    name: "Default Series",
                    data: [{ y: 100 }],
                    measureIdentifier: "default_metric",
                },
            ];

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = setupDistinctPointShapesToSeries(
                mockChartOptions.type,
                seriesWithoutType,
                config,
                mockMeasureGroup,
            );

            const series = result as any[];
            expect(series[0].marker.symbol).toBe("circle");
            expect(series[0].pointShape).toBe("circle");
        });
    });

    describe("edge cases", () => {
        it("should handle empty series array", () => {
            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = setupDistinctPointShapesToSeries(
                mockChartOptions.type,
                [],
                config,
                mockMeasureGroup,
            );

            expect(result).toEqual([]);
        });

        it("should handle null series", () => {
            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = setupDistinctPointShapesToSeries(
                mockChartOptions.type,
                null as any,
                config,
                mockMeasureGroup,
            );

            expect(result).toBeNull();
        });

        it("should handle undefined series", () => {
            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = setupDistinctPointShapesToSeries(
                mockChartOptions.type,
                undefined as any,
                config,
                mockMeasureGroup,
            );

            expect(result).toBeUndefined();
        });

        it("should handle series that are not arrays", () => {
            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = setupDistinctPointShapesToSeries(
                mockChartOptions.type,
                "not an array" as any,
                config,
                mockMeasureGroup,
            );

            expect(result).toBe("not an array");
        });
    });

    describe("shape assignment validation", () => {
        it("should assign all 5 available shapes correctly", () => {
            const fiveSeriesData: any[] = Array.from({ length: 5 }, (_, index) => ({
                name: `Series ${index + 1}`,
                type: "line",
                data: [{ y: 100 + index * 10 }],
                measureIdentifier: `metric_${index + 1}`,
            }));

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = setupDistinctPointShapesToSeries(
                mockChartOptions.type,
                fiveSeriesData,
                config,
                mockMeasureGroup,
            );

            const expectedShapes = ["circle", "square", "triangle", "triangle-down", "diamond"];
            const series = result as any[];

            expectedShapes.forEach((expectedShape, index) => {
                expect(series[index].marker.symbol).toBe(expectedShape);
                expect(series[index].pointShape).toBe(expectedShape);
            });
        });
    });

    describe("local identifier mapping", () => {
        it("should apply point shapes based on measure local identifiers", () => {
            const config: IChartConfig = {
                distinctPointShapes: {
                    enabled: true,
                    pointShapeMapping: {
                        revenue_metric: "square",
                        profit_metric: "diamond",
                        cost_metric: "triangle",
                    },
                },
            };

            const result = setupDistinctPointShapesToSeries(
                mockChartOptions.type,
                mockSeriesData,
                config,
                mockMeasureGroup,
            );

            const series = result as any[];

            expect(series).toBeDefined();
            expect(series).toHaveLength(3);

            // First series should use square (mapped from revenue_metric)
            expect(series[0].marker.symbol).toBe("square");
            expect(series[0].pointShape).toBe("square");

            // Second series should use diamond (mapped from profit_metric)
            expect(series[1].marker.symbol).toBe("diamond");
            expect(series[1].pointShape).toBe("diamond");

            // Third series should use triangle (mapped from cost_metric)
            expect(series[2].marker.symbol).toBe("triangle");
            expect(series[2].pointShape).toBe("triangle");
        });

        it("should fallback to default shapes when local identifier is not in mapping", () => {
            const config: IChartConfig = {
                distinctPointShapes: {
                    enabled: true,
                    pointShapeMapping: {
                        revenue_metric: "square",
                        // profit_metric and cost_metric not mapped
                    },
                },
            };

            const result = setupDistinctPointShapesToSeries(
                mockChartOptions.type,
                mockSeriesData,
                config,
                mockMeasureGroup,
            );

            const series = result as any[];

            expect(series).toBeDefined();
            expect(series).toHaveLength(3);

            // First series should use square (mapped)
            expect(series[0].marker.symbol).toBe("square");

            // Second series should fallback to default shape (second in config: square)
            expect(series[1].marker.symbol).toBe("square");

            // Third series should fallback to default shape (third in config: triangle)
            expect(series[2].marker.symbol).toBe("triangle");
        });
    });
});
