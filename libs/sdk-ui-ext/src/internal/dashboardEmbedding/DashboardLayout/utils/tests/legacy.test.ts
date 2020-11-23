// (C) 2019-2020 GoodData Corporation

import {
    calculateGeoPushpinWidgetHeight,
    getGeoPushpinWidgetStyle,
    getResponsiveClassName,
    isFullWidthGeoPushpin,
    updateHeadlineClassName,
} from "../legacy";

const createDomNode = (className: string) => {
    const visDom = document.createElement("div");
    visDom.className = className;
    return visDom;
};

describe("legacy", () => {
    describe("getResponsiveClassName", () => {
        it.each([
            ["small", 170, false],
            ["shortened-label", 170, true],
            ["medium", 200, true],
            ["large", 200, false],
        ])("should return className is %s", (expected: string, width: number, isShorttened: boolean) => {
            expect(getResponsiveClassName(width, isShorttened)).toEqual(expected);
        });
    });

    describe("updateHeadlineClassName", () => {
        it.each([
            ["small", " relative", 170, 14],
            ["medium", " absolute", 200, 42],
        ])(
            "should update responsive className is %s and visualization content className is %s",
            (expected: string, expectedPosition: string, width: number, height: number) => {
                const visualizationNode = createDomNode("visualization");
                const visualizationContent = createDomNode("gd-visualization-content");
                const headlineNode = createDomNode("headline-compare-section");
                const headlineSecondaryItem = createDomNode("headline-secondary-item");
                const headlineLabel = createDomNode("headline-title-wrapper");
                const titleNode = document.createTextNode("Metric has format #.###'00");
                headlineLabel.appendChild(titleNode);
                headlineSecondaryItem.appendChild(headlineLabel);
                headlineNode.appendChild(headlineSecondaryItem);
                visualizationContent.appendChild(headlineNode);
                visualizationNode.appendChild(visualizationContent);
                headlineLabel.getBoundingClientRect = jest.fn(() => {
                    return { height } as DOMRect;
                });
                headlineLabel.style.lineHeight = "14px";

                updateHeadlineClassName(visualizationNode, width);

                expect(visualizationContent.className).toEqual(`gd-visualization-content${expectedPosition}`);
                expect(headlineNode.className).toEqual(
                    `gd-flex-container headline-compare-section ${expected}`,
                );
            },
        );
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
