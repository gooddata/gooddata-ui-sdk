// (C) 2019-2024 GoodData Corporation

import {
    calculateGeoPushpinWidgetHeight,
    getGeoPushpinWidgetStyle,
    isFullWidthGeoPushpin,
} from "../legacy.js";
import { describe, it, expect } from "vitest";

describe("legacy", () => {
    describe("calculateGeoPushpinWidgetHeight", () => {
        const visualizationItemWidth = 1000;
        it("should return height, maxHeight value", () => {
            const windowHeight = 1000;
            expect(calculateGeoPushpinWidgetHeight(windowHeight, visualizationItemWidth)).toEqual({
                height: 563,
                maxHeight: 615,
            });
        });

        it("should return height, defaultVisualizationHeight value when geoContainer has maxHeight is smaller than minHeight of Parent Container", () => {
            const windowHeight = 768;
            expect(calculateGeoPushpinWidgetHeight(windowHeight, visualizationItemWidth)).toEqual({
                height: 563,
                maxHeight: 383,
            });
        });
    });

    describe("isFullWidthGeoPushpin", () => {
        it("should geo pushpin be full width", () => {
            expect(isFullWidthGeoPushpin(12, "pushpin")).toEqual(true);
        });
    });

    describe("getGeoPushpinWidgetStyle", () => {
        const expectedGeoPushpinFullWidthStyle = {
            height: 563,
            maxHeight: 383,
        };

        it.each([
            ["return height and maxHeight", 12, expectedGeoPushpinFullWidthStyle, false],
            ["doesn't return height and maxHeight", 8, null, false],
            ["doesn't return height and maxHeight when enableCustomHeight FF is set to true", 12, null, true],
        ])("should getStyle %s", (_text, currentColumnWidth, expected, enableCustomHeight) => {
            const visType = "pushpin";
            const visWidth = 1000;
            const windowHeight = 768;
            expect(
                getGeoPushpinWidgetStyle(
                    visType,
                    visWidth,
                    currentColumnWidth,
                    windowHeight,
                    enableCustomHeight,
                ),
            ).toEqual(expected);
        });
    });
});
