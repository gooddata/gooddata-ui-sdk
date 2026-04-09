// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    getNormalizedAnomalyDetectionValues,
    mapVisualizationAnomalyDetectionToBackendConfig,
    mapVisualizationAnomalyDetectionToChartConfig,
} from "../anomalyDetectionMapping.js";

const baseVisualization = {};

describe("anomalyDetectionMapping", () => {
    describe("getNormalizedAnomalyDetectionValues", () => {
        it("empty anomaly detection convert", () => {
            const result = getNormalizedAnomalyDetectionValues({
                anomalyDetection: {},
            });
            expect(result).toEqual({
                color: {
                    type: "rgb",
                    value: {
                        b: 0,
                        g: 0,
                        r: 255,
                    },
                },
                sensitivity: "medium",
                size: "small",
            });
        });

        it("should parse hex colors correctly", () => {
            const result = getNormalizedAnomalyDetectionValues({
                anomalyDetection: { sensitivity: "LOW", color: "#FF0000" },
            });
            expect(result?.color).toEqual({
                type: "rgb",
                value: { r: 255, g: 0, b: 0 },
            });
        });

        it("should parse rgb colors correctly", () => {
            const result = getNormalizedAnomalyDetectionValues({
                anomalyDetection: { sensitivity: "LOW", color: "rgb(0, 255, 0)" },
            });
            expect(result?.color).toEqual({
                type: "rgb",
                value: { r: 0, g: 255, b: 0 },
            });
        });

        it("should parse rgb colors with spaces correctly", () => {
            const result = getNormalizedAnomalyDetectionValues({
                anomalyDetection: { sensitivity: "LOW", color: "rgb(  10 ,20,  30  )" },
            });
            expect(result?.color).toEqual({
                type: "rgb",
                value: { r: 10, g: 20, b: 30 },
            });
        });

        it("should use default color if not provided", () => {
            const result = getNormalizedAnomalyDetectionValues({
                anomalyDetection: { sensitivity: "LOW" },
            });
            expect(result?.color).toEqual({
                type: "rgb",
                value: { r: 255, g: 0, b: 0 },
            });
        });
    });

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
