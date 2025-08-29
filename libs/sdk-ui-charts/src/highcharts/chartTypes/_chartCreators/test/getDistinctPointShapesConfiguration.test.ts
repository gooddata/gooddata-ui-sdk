// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { IChartConfig } from "../../../../interfaces/index.js";
import { IChartOptions } from "../../../typings/unsafe.js";
import { getDistinctPointShapesConfiguration } from "../getDistinctPointShapesConfiguration.js";

describe("getDistinctPointShapesConfiguration", () => {
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

    const mockHighchartsOptions: any = {
        series: mockSeriesData,
    };

    describe("when distinctPointShapes is disabled", () => {
        it("should return empty object when distinctPointShapes is not enabled", () => {
            const config: IChartConfig = {
                distinctPointShapes: { enabled: false },
            };

            const result = getDistinctPointShapesConfiguration(
                mockChartOptions,
                mockHighchartsOptions,
                config,
            );

            expect(result).toEqual({});
        });

        it("should return empty object when distinctPointShapes is undefined", () => {
            const config: IChartConfig = {};

            const result = getDistinctPointShapesConfiguration(
                mockChartOptions,
                mockHighchartsOptions,
                config,
            );

            expect(result).toEqual({});
        });

        it("should return empty object when dataPoints are hidden", () => {
            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
                dataPoints: { visible: false },
            };

            const result = getDistinctPointShapesConfiguration(
                mockChartOptions,
                mockHighchartsOptions,
                config,
            );

            expect(result).toEqual({});
        });
    });

    describe("chart type support", () => {
        it("should return empty object for unsupported chart types", () => {
            const barChartOptions: IChartOptions = {
                ...mockChartOptions,
                type: "column",
            };

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = getDistinctPointShapesConfiguration(
                barChartOptions,
                mockHighchartsOptions,
                config,
            );

            expect(result).toEqual({});
        });

        it("should support line charts", () => {
            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = getDistinctPointShapesConfiguration(
                mockChartOptions,
                mockHighchartsOptions,
                config,
            );

            expect(result.series).toBeDefined();
            expect(result.series).toHaveLength(3);
        });

        it("should support area charts", () => {
            const areaChartOptions: IChartOptions = {
                ...mockChartOptions,
                type: "area",
            };

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = getDistinctPointShapesConfiguration(
                areaChartOptions,
                mockHighchartsOptions,
                config,
            );

            expect(result.series).toBeDefined();
            expect(result.series).toHaveLength(3);
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

            const result = getDistinctPointShapesConfiguration(
                comboChartOptions,
                mockHighchartsOptions,
                config,
            );

            expect(result.series).toBeDefined();
            expect(result.series).toHaveLength(3);
        });

        it("should not support combo charts without line types", () => {
            const comboChartOptions: IChartOptions = {
                ...mockChartOptions,
                type: "combo",
            };

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
                primaryChartType: "column",
                secondaryChartType: "column",
            };

            const result = getDistinctPointShapesConfiguration(
                comboChartOptions,
                mockHighchartsOptions,
                config,
            );

            expect(result).toEqual({});
        });
    });

    describe("automatic shape assignment", () => {
        it("should assign shapes in sequence from POINT_SHAPES_CONFIGS", () => {
            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = getDistinctPointShapesConfiguration(
                mockChartOptions,
                mockHighchartsOptions,
                config,
            );

            const expectedShapes = ["circle", "square", "triangle"];
            const series = result.series as any[];

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

            const extendedHighchartsOptions: any = {
                series: extendedSeriesData,
            };

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = getDistinctPointShapesConfiguration(
                mockChartOptions,
                extendedHighchartsOptions,
                config,
            );

            // Should cycle back to the beginning
            const series = result.series as any[];
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

            const highchartsOptionsWithMarkers: any = {
                series: seriesWithMarkers,
            };

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = getDistinctPointShapesConfiguration(
                mockChartOptions,
                highchartsOptionsWithMarkers,
                config,
            );

            const series = result.series as any[];
            expect(series[0].marker).toEqual({
                enabled: true,
                radius: 5,
                lineWidth: 2,
                symbol: "circle",
            });
        });
    });

    describe("series type filtering", () => {
        it("should only apply shapes to line and area series", () => {
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

            const mixedHighchartsOptions: any = {
                series: mixedSeriesData,
            };

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = getDistinctPointShapesConfiguration(
                mockChartOptions,
                mixedHighchartsOptions,
                config,
            );

            const series = result.series as any[];

            // Line series (index 0) should have marker with first shape
            expect(series[0].marker.symbol).toBe("circle");
            expect(series[0].pointShape).toBe("circle");

            // Column series (index 1) should not have marker changes
            expect(series[1].marker).toBeUndefined();
            expect(series[1].pointShape).toBeUndefined();

            // Area series (index 2) should have marker with third shape (because it's the third series overall)
            expect(series[2].marker.symbol).toBe("triangle");
            expect(series[2].pointShape).toBe("triangle");
        });

        it("should apply shapes to series with no type (defaults to line)", () => {
            const seriesWithoutType: any[] = [
                {
                    name: "Default Series",
                    data: [{ y: 100 }],
                    measureIdentifier: "default_metric",
                },
            ];

            const highchartsOptionsWithoutType: any = {
                series: seriesWithoutType,
            };

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = getDistinctPointShapesConfiguration(
                mockChartOptions,
                highchartsOptionsWithoutType,
                config,
            );

            const series = result.series as any[];
            expect(series[0].marker.symbol).toBe("circle");
            expect(series[0].pointShape).toBe("circle");
        });
    });

    describe("edge cases", () => {
        it("should handle empty series array", () => {
            const emptyHighchartsOptions = {
                series: [],
            };

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = getDistinctPointShapesConfiguration(
                mockChartOptions,
                emptyHighchartsOptions,
                config,
            );

            expect(result.series).toEqual([]);
        });

        it("should handle null series", () => {
            const nullHighchartsOptions = {
                series: null,
            };

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = getDistinctPointShapesConfiguration(
                mockChartOptions,
                nullHighchartsOptions as any,
                config,
            );

            expect(result.series).toBeNull();
        });

        it("should handle undefined series", () => {
            const undefinedHighchartsOptions = {};

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = getDistinctPointShapesConfiguration(
                mockChartOptions,
                undefinedHighchartsOptions,
                config,
            );

            expect(result.series).toBeUndefined();
        });

        it("should handle series that are not arrays", () => {
            const invalidHighchartsOptions = {
                series: "not an array" as any,
            };

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = getDistinctPointShapesConfiguration(
                mockChartOptions,
                invalidHighchartsOptions,
                config,
            );

            expect(result.series).toBe("not an array");
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

            const fiveSeriesHighchartsOptions: any = {
                series: fiveSeriesData,
            };

            const config: IChartConfig = {
                distinctPointShapes: { enabled: true },
            };

            const result = getDistinctPointShapesConfiguration(
                mockChartOptions,
                fiveSeriesHighchartsOptions,
                config,
            );

            const expectedShapes = ["circle", "square", "triangle", "triangle-down", "diamond"];
            const series = result.series as any[];

            expectedShapes.forEach((expectedShape, index) => {
                expect(series[index].marker.symbol).toBe(expectedShape);
                expect(series[index].pointShape).toBe(expectedShape);
            });
        });
    });
});
