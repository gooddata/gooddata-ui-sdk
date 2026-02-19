// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IGenAIVisualization } from "@gooddata/sdk-model";

import {
    mapVisualizationForecastToBackendConfig,
    mapVisualizationForecastToChartConfig,
} from "../forecastMapping.js";

const baseVisualization: IGenAIVisualization = {
    id: "vis-id",
    title: "Revenue trend",
    visualizationType: "LINE",
    metrics: [],
    dimensionality: [],
};

function createVisualization(forecast: IGenAIVisualization["config"]): IGenAIVisualization {
    return {
        ...baseVisualization,
        config: forecast,
    };
}

describe("forecast mapping", () => {
    it("maps forecast to chart config", () => {
        const visualization = createVisualization({
            forecast: {
                forecastPeriod: 3,
                confidenceLevel: 0.95,
                seasonal: true,
            },
        });

        expect(mapVisualizationForecastToChartConfig(visualization)).toEqual({
            enabled: true,
            period: 3,
            confidence: 0.95,
            seasonal: true,
        });
    });

    it("normalizes confidence from percentage for chart and backend mapping", () => {
        const visualization = createVisualization({
            forecast: {
                forecastPeriod: 4,
                confidenceLevel: 95,
                seasonal: false,
            },
        });

        expect(mapVisualizationForecastToChartConfig(visualization)).toEqual({
            enabled: true,
            period: 4,
            confidence: 0.95,
            seasonal: false,
        });
        expect(mapVisualizationForecastToBackendConfig(visualization)).toEqual({
            forecastPeriod: 4,
            confidenceLevel: 0.95,
            seasonal: false,
        });
    });

    it("returns undefined for invalid forecast values", () => {
        const invalidPeriod = createVisualization({
            forecast: {
                forecastPeriod: 0,
                confidenceLevel: 0.95,
                seasonal: false,
            },
        });
        const invalidConfidence = createVisualization({
            forecast: {
                forecastPeriod: 3,
                confidenceLevel: 120,
                seasonal: false,
            },
        });

        expect(mapVisualizationForecastToChartConfig(invalidPeriod)).toBeUndefined();
        expect(mapVisualizationForecastToChartConfig(invalidConfidence)).toBeUndefined();
        expect(mapVisualizationForecastToBackendConfig(invalidPeriod)).toBeUndefined();
        expect(mapVisualizationForecastToBackendConfig(invalidConfidence)).toBeUndefined();
    });
});
