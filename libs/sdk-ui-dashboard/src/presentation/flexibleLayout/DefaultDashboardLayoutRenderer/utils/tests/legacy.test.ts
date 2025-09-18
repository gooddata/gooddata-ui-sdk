// (C) 2019-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { calculateGeoPushpinWidgetHeight, isFullWidthGeoPushpin } from "../legacy.js";

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
});
