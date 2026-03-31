// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    mapVisualizationForecastToBackendConfig,
    mapVisualizationForecastToChartConfig,
} from "../forecastMapping.js";

describe("forecast mapping", () => {
    it("maps forecast to chart config", () => {
        expect(
            mapVisualizationForecastToChartConfig({
                forecast: {
                    forecastPeriod: 3,
                    confidenceLevel: 0.95,
                    seasonal: true,
                },
            }),
        ).toEqual({
            enabled: true,
            period: 3,
            confidence: 0.95,
            seasonal: true,
        });
    });

    it("normalizes confidence from percentage for chart and backend mapping", () => {
        expect(
            mapVisualizationForecastToChartConfig({
                forecast: {
                    forecastPeriod: 4,
                    confidenceLevel: 95,
                    seasonal: false,
                },
            }),
        ).toEqual({
            enabled: true,
            period: 4,
            confidence: 0.95,
            seasonal: false,
        });
        expect(
            mapVisualizationForecastToBackendConfig({
                forecast: {
                    forecastPeriod: 4,
                    confidenceLevel: 95,
                    seasonal: false,
                },
            }),
        ).toEqual({
            forecastPeriod: 4,
            confidenceLevel: 0.95,
            seasonal: false,
        });
    });

    it("returns undefined for invalid forecast values", () => {
        expect(
            mapVisualizationForecastToChartConfig({
                forecast: {
                    forecastPeriod: 0,
                    confidenceLevel: 0.95,
                    seasonal: false,
                },
            }),
        ).toBeUndefined();
        expect(
            mapVisualizationForecastToChartConfig({
                forecast: {
                    forecastPeriod: 3,
                    confidenceLevel: 120,
                    seasonal: false,
                },
            }),
        ).toBeUndefined();
        expect(
            mapVisualizationForecastToBackendConfig({
                forecast: {
                    forecastPeriod: 0,
                    confidenceLevel: 0.95,
                    seasonal: false,
                },
            }),
        ).toBeUndefined();
        expect(
            mapVisualizationForecastToBackendConfig({
                forecast: {
                    forecastPeriod: 3,
                    confidenceLevel: 120,
                    seasonal: false,
                },
            }),
        ).toBeUndefined();
    });
});
