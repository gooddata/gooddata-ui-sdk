// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    getNormalizedAnomalyDetectionValues,
    mapVisualizationAnomalyDetectionToChartConfig,
} from "./anomalyDetectionMapping.js";

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

        it.each([
            { color: "#12aBcF", value: { r: 18, g: 171, b: 207 } },
            { color: "#000000", value: { r: 0, g: 0, b: 0 } },
            { color: "#FFFFFF", value: { r: 255, g: 255, b: 255 } },
            { color: "RGB(0, 128, 255)", value: { r: 0, g: 128, b: 255 } },
            { color: "rgb(255,255,255)", value: { r: 255, g: 255, b: 255 } },
            { color: "rgb(000, 010, 255)", value: { r: 0, g: 10, b: 255 } },
        ])("should preserve valid color $color", ({ color, value }) => {
            expect(getNormalizedAnomalyDetectionValues({ anomalyDetection: { color } })?.color).toEqual({
                type: "rgb",
                value,
            });
        });

        it.each([
            "",
            "blue",
            "#",
            "#fff",
            "#0f0",
            "#12",
            "#1234",
            "#12345",
            "#1234567",
            "#12345678",
            "#gg1122",
            "#12g456",
            "#0011gg",
            "#123456suffix",
            "rgb(256, 20, 30)",
            "rgb(10, 256, 30)",
            "rgb(10, 20, 256)",
            "rgb(9999999999999999999999999, 20, 30)",
            "rgb(-1, 20, 30)",
            "rgb(10.5, 20, 30)",
            "rgb(10%, 20%, 30%)",
            "rgb(10, 20)",
            "rgb(10, 20, 30",
            "rgba(10, 20, 30, 0.5)",
            "rgbprefixrgb(10, 20, 30)",
            "rgb(10, 20, 30) trailing",
            "rgb(10, 20, 30)rgb(40, 50, 60)",
        ])("should fall back to red for invalid or unsupported color '%s'", (color) => {
            expect(getNormalizedAnomalyDetectionValues({ anomalyDetection: { color } })?.color).toEqual({
                type: "rgb",
                value: { r: 255, g: 0, b: 0 },
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

        it.each(["anomalyDetection", "anomalies"] as const)(
            "should preserve %s options when falling back to red",
            (key) => {
                expect(
                    mapVisualizationAnomalyDetectionToChartConfig({
                        [key]: { sensitivity: "HIGH", size: "big", color: "rgb(10, 20, 256)" },
                    }),
                ).toEqual({
                    enabled: true,
                    sensitivity: "high",
                    size: "big",
                    color: { type: "rgb", value: { r: 255, g: 0, b: 0 } },
                });
            },
        );

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
});
