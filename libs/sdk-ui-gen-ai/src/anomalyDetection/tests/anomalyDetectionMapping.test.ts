// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    mapVisualizationAnomalyDetectionToBackendConfig,
    mapVisualizationAnomalyDetectionToChartConfig,
} from "../anomalyDetectionMapping.js";

const baseVisualization = {};

describe("anomalyDetectionMapping", () => {
    describe("mapVisualizationAnomalyDetectionToChartConfig", () => {
        it("should return undefined if anomalyDetection is missing", () => {
            expect(mapVisualizationAnomalyDetectionToChartConfig(baseVisualization)).toBeUndefined();
        });

        it("should map LOW sensitivity correctly", () => {
            expect(
                mapVisualizationAnomalyDetectionToChartConfig({
                    anomalyDetection: { sensitivity: "LOW" },
                }),
            ).toEqual({
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
            expect(
                mapVisualizationAnomalyDetectionToChartConfig({
                    anomalyDetection: { sensitivity: "MEDIUM" },
                })?.sensitivity,
            ).toBe("medium");
        });

        it("should map HIGH sensitivity correctly", () => {
            expect(
                mapVisualizationAnomalyDetectionToChartConfig({
                    anomalyDetection: { sensitivity: "HIGH" },
                })?.sensitivity,
            ).toBe("high");
        });

        it("should return undefined for invalid sensitivity", () => {
            expect(
                mapVisualizationAnomalyDetectionToChartConfig({
                    anomalyDetection: { sensitivity: "INVALID" as any },
                }),
            ).toBeUndefined();
        });
    });

    describe("mapVisualizationAnomalyDetectionToBackendConfig", () => {
        it("should return undefined if anomalyDetection is missing", () => {
            expect(mapVisualizationAnomalyDetectionToBackendConfig(baseVisualization)).toBeUndefined();
        });

        it("should map sensitivity correctly", () => {
            expect(
                mapVisualizationAnomalyDetectionToBackendConfig({
                    anomalyDetection: { sensitivity: "MEDIUM" },
                }),
            ).toEqual({
                sensitivity: "medium",
            });
        });
    });
});
