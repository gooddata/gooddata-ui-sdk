// (C) 2019-2020 GoodData Corporation

import {
    calculateGeoPushpinWidgetHeight,
    getGeoPushpinWidgetStyle,
    getResponsiveClassName,
    isFullWidthGeoPushpin,
} from "../legacy";

describe("legacy", () => {
    describe("getResponsiveClassName", () => {
        it.each([
            ["small", 170, false],
            ["shortened-label", 170, true],
            ["medium", 200, true],
            ["large", 200, false],
        ])("should return className is %s", (expected: string, width: number, isShortened: boolean) => {
            expect(getResponsiveClassName(width, isShortened)).toEqual(expected);
        });
    });

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
            ["return height and maxHeight", 12, expectedGeoPushpinFullWidthStyle],
            ["doesn't return height and maxHeight", 8, null],
        ])("should getStyle %s", (_text, currentColumnWidth, expected) => {
            const visType = "pushpin";
            const visWidth = 1000;
            const windowHeight = 768;
            expect(getGeoPushpinWidgetStyle(visType, visWidth, currentColumnWidth, windowHeight)).toEqual(
                expected,
            );
        });
    });
});
