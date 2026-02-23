// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { CreatedVisualization } from "@gooddata/api-client-tiger";

import { convertCreatedVisualization } from "./ChatThread.js";

const baseCreatedVisualization: CreatedVisualization = {
    id: "generated-line",
    title: "Revenue trend",
    visualizationType: "LINE",
    metrics: [],
    dimensionality: [],
    filters: [],
    suggestions: [],
};

describe("convertCreatedVisualization", () => {
    it("preserves forecast config in created visualization conversion", () => {
        const converted = convertCreatedVisualization({
            ...baseCreatedVisualization,
            config: {
                forecast: {
                    forecastPeriod: 3,
                    confidenceLevel: 0.95,
                    seasonal: true,
                },
            },
        });

        expect(converted.config).toEqual({
            forecast: {
                forecastPeriod: 3,
                confidenceLevel: 0.95,
                seasonal: true,
            },
        });
    });

    it("keeps config undefined when backend does not send it", () => {
        const converted = convertCreatedVisualization(baseCreatedVisualization);

        expect(converted.config).toBeUndefined();
    });

    it("preserves anomaly detection config in created visualization conversion", () => {
        const converted = convertCreatedVisualization({
            ...baseCreatedVisualization,
            config: {
                anomalyDetection: {
                    sensitivity: "MEDIUM",
                },
            },
        });

        expect(converted.config).toEqual({
            anomalyDetection: {
                sensitivity: "MEDIUM",
            },
        });
    });

    it("preserves both forecast and anomaly detection config when both are provided", () => {
        const converted = convertCreatedVisualization({
            ...baseCreatedVisualization,
            config: {
                forecast: {
                    forecastPeriod: 3,
                    confidenceLevel: 0.95,
                    seasonal: true,
                },
                anomalyDetection: {
                    sensitivity: "HIGH",
                },
            },
        });

        expect(converted.config).toEqual({
            forecast: {
                forecastPeriod: 3,
                confidenceLevel: 0.95,
                seasonal: true,
            },
            anomalyDetection: {
                sensitivity: "HIGH",
            },
        });
    });

    it("preserves clustering config in created visualization conversion", () => {
        const converted = convertCreatedVisualization({
            ...baseCreatedVisualization,
            config: {
                clustering: {
                    numberOfClusters: 3,
                    threshold: 0.5,
                },
            },
        });

        expect(converted.config).toEqual({
            clustering: {
                numberOfClusters: 3,
                threshold: 0.5,
            },
        });
    });

    it("preserves all configs (forecast, anomaly detection, clustering) when all are provided", () => {
        const converted = convertCreatedVisualization({
            ...baseCreatedVisualization,
            config: {
                forecast: {
                    forecastPeriod: 3,
                    confidenceLevel: 0.95,
                    seasonal: true,
                },
                anomalyDetection: {
                    sensitivity: "HIGH",
                },
                clustering: {
                    numberOfClusters: 5,
                    threshold: 0.1,
                },
            },
        });

        expect(converted.config).toEqual({
            forecast: {
                forecastPeriod: 3,
                confidenceLevel: 0.95,
                seasonal: true,
            },
            anomalyDetection: {
                sensitivity: "HIGH",
            },
            clustering: {
                numberOfClusters: 5,
                threshold: 0.1,
            },
        });
    });
});
