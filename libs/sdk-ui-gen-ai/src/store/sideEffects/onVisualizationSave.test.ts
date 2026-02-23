// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IGenAIVisualization } from "@gooddata/sdk-model";

import { buildLineChart, buildScatterPlot } from "./onVisualizationSave.js";

const baseLineVisualization: IGenAIVisualization = {
    id: "generated-line",
    title: "Generated line",
    visualizationType: "LINE",
    metrics: [
        {
            id: "revenue",
            type: "metric",
        },
    ],
    dimensionality: [
        {
            id: "date.month",
            type: "attribute",
        },
    ],
    filters: [],
};

describe("buildLineChart", () => {
    it("stores forecast in insight controls when forecast is present", () => {
        const visualization: IGenAIVisualization = {
            ...baseLineVisualization,
            config: {
                forecast: {
                    forecastPeriod: 6,
                    confidenceLevel: 95,
                    seasonal: true,
                },
            },
        };

        const result = buildLineChart(visualization, "Saved line chart");

        expect(result.insight.properties).toEqual({
            legend: {
                responsive: "autoPositionWithPopup",
            },
            controls: {
                forecast: {
                    enabled: true,
                    period: 6,
                    confidence: 0.95,
                    seasonal: true,
                },
            },
        });
    });

    it("keeps line chart properties unchanged when forecast and anomalies are missing", () => {
        const result = buildLineChart(baseLineVisualization, "Saved line chart");

        expect(result.insight.properties).toEqual({
            legend: {
                responsive: "autoPositionWithPopup",
            },
        });
    });

    it("stores anomalies in insight controls when anomalyDetection is present", () => {
        const visualization: IGenAIVisualization = {
            ...baseLineVisualization,
            config: {
                anomalyDetection: {
                    sensitivity: "HIGH",
                },
            },
        };

        const result = buildLineChart(visualization, "Saved line chart");

        expect(result.insight.properties).toEqual({
            legend: {
                responsive: "autoPositionWithPopup",
            },
            controls: {
                anomalies: {
                    enabled: true,
                    sensitivity: "high",
                    size: "small",
                    color: {
                        type: "rgb",
                        value: { r: 255, g: 0, b: 0 },
                    },
                },
            },
        });
    });

    it("stores both forecast and anomalies when both are present", () => {
        const visualization: IGenAIVisualization = {
            ...baseLineVisualization,
            config: {
                forecast: {
                    forecastPeriod: 6,
                    confidenceLevel: 95,
                    seasonal: true,
                },
                anomalyDetection: {
                    sensitivity: "MEDIUM",
                },
            },
        };

        const result = buildLineChart(visualization, "Saved line chart");

        expect(result.insight.properties?.["controls"]).toEqual({
            forecast: {
                enabled: true,
                period: 6,
                confidence: 0.95,
                seasonal: true,
            },
            anomalies: {
                enabled: true,
                sensitivity: "medium",
                size: "small",
                color: {
                    type: "rgb",
                    value: { r: 255, g: 0, b: 0 },
                },
            },
        });
    });
});

describe("buildScatterPlot", () => {
    const baseScatterVisualization: IGenAIVisualization = {
        id: "generated-scatter",
        title: "Generated scatter",
        visualizationType: "SCATTER",
        metrics: [
            {
                id: "m1",
                type: "metric",
            },
            {
                id: "m2",
                type: "metric",
            },
        ],
        dimensionality: [
            {
                id: "a1",
                type: "attribute",
            },
        ],
        filters: [],
    };

    it("builds scatter plot without clustering", () => {
        const result = buildScatterPlot(baseScatterVisualization, "Saved scatter plot");

        expect(result.insight.visualizationUrl).toBe("local:scatter");
        expect(result.insight.buckets.length).toBe(3);
        expect(result.insight.properties).toEqual({});
    });

    it("builds scatter plot with clustering", () => {
        const visualization: IGenAIVisualization = {
            ...baseScatterVisualization,
            config: {
                clustering: {
                    numberOfClusters: 4,
                },
            },
        };

        const result = buildScatterPlot(visualization, "Saved scatter plot");

        expect(result.insight.properties).toEqual({
            controls: {
                clustering: {
                    enabled: true,
                    numberOfClusters: 4,
                },
            },
        });
    });

    it("builds scatter plot with segmentBy", () => {
        const visualization: IGenAIVisualization = {
            ...baseScatterVisualization,
            dimensionality: [
                {
                    id: "a1",
                    type: "attribute",
                },
                {
                    id: "a2",
                    type: "attribute",
                },
            ],
        };

        const result = buildScatterPlot(visualization, "Saved scatter plot");

        expect(result.insight.buckets.length).toBe(4);
        expect(result.insight.buckets[3].localIdentifier).toBe("segment");
    });
});
