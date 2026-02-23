// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IGenAIVisualization } from "@gooddata/sdk-model";

import {
    mapVisualizationAnomalyDetectionToBackendConfig,
    mapVisualizationAnomalyDetectionToChartConfig,
} from "../anomalyDetectionMapping.js";

const baseVisualization: IGenAIVisualization = {
    id: "generated-line",
    title: "Revenue trend",
    visualizationType: "LINE",
    metrics: [],
    dimensionality: [],
    filters: [],
    suggestions: [],
};

describe("anomalyDetectionMapping", () => {
    describe("mapVisualizationAnomalyDetectionToChartConfig", () => {
        it("should return undefined if anomalyDetection is missing", () => {
            expect(mapVisualizationAnomalyDetectionToChartConfig(baseVisualization)).toBeUndefined();
        });

        it("should map LOW sensitivity correctly", () => {
            const vis: IGenAIVisualization = {
                ...baseVisualization,
                config: {
                    anomalyDetection: { sensitivity: "LOW" },
                },
            };
            expect(mapVisualizationAnomalyDetectionToChartConfig(vis)).toEqual({
                enabled: true,
                sensitivity: "low",
                size: "small",
                color: {
                    type: "rgb",
                    value: { r: 255, g: 0, b: 0 },
                },
            });
        });

        it("should map MEDIUM sensitivity correctly", () => {
            const vis: IGenAIVisualization = {
                ...baseVisualization,
                config: {
                    anomalyDetection: { sensitivity: "MEDIUM" },
                },
            };
            expect(mapVisualizationAnomalyDetectionToChartConfig(vis)?.sensitivity).toBe("medium");
        });

        it("should map HIGH sensitivity correctly", () => {
            const vis: IGenAIVisualization = {
                ...baseVisualization,
                config: {
                    anomalyDetection: { sensitivity: "HIGH" },
                },
            };
            expect(mapVisualizationAnomalyDetectionToChartConfig(vis)?.sensitivity).toBe("high");
        });

        it("should return undefined for invalid sensitivity", () => {
            const vis: IGenAIVisualization = {
                ...baseVisualization,
                config: {
                    anomalyDetection: { sensitivity: "INVALID" as any },
                },
            };
            expect(mapVisualizationAnomalyDetectionToChartConfig(vis)).toBeUndefined();
        });
    });

    describe("mapVisualizationAnomalyDetectionToBackendConfig", () => {
        it("should return undefined if anomalyDetection is missing", () => {
            expect(mapVisualizationAnomalyDetectionToBackendConfig(baseVisualization)).toBeUndefined();
        });

        it("should map sensitivity correctly", () => {
            const vis: IGenAIVisualization = {
                ...baseVisualization,
                config: {
                    anomalyDetection: { sensitivity: "MEDIUM" },
                },
            };
            expect(mapVisualizationAnomalyDetectionToBackendConfig(vis)).toEqual({
                sensitivity: "medium",
            });
        });
    });
});
