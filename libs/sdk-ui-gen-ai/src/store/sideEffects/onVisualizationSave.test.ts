// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IGenAIVisualization } from "@gooddata/sdk-model";

import { buildLineChart } from "./onVisualizationSave.js";

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

    it("keeps line chart properties unchanged when forecast is missing", () => {
        const result = buildLineChart(baseLineVisualization, "Saved line chart");

        expect(result.insight.properties).toEqual({
            legend: {
                responsive: "autoPositionWithPopup",
            },
        });
    });
});
