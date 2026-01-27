// (C) 2023-2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { DefaultLocale } from "@gooddata/sdk-ui";

import { type IVisConstruct } from "../../../../interfaces/Visualization.js";
import {
    arithmeticMeasureItems,
    attributeItems,
    emptyReferencePoint,
    masterMeasureItems,
    multipleMetricsNoCategoriesReferencePoint,
    onePrimaryMetricAndOneViewByRefPoint,
    overTimeComparisonDateItem,
    simpleGeoPushpinReferencePoint,
} from "../../../../tests/mocks/referencePointMocks.js";
import { insightWithSingleMeasure } from "../../../../tests/mocks/testMocks.js";
import { DEFAULT_MESSAGES } from "../../../../utils/translations.js";
import { getLastRenderEl } from "../../tests/pluggableVisualizations.test.helpers.js";
import { PluggableWaterfallChart } from "../PluggableWaterfallChart.js";

describe("PluggableWaterfallChart", () => {
    const messages = DEFAULT_MESSAGES[DefaultLocale as keyof typeof DEFAULT_MESSAGES];

    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();
    const executionFactory = dummyBackend().workspace("PROJECTID").execution();
    const defaultProps = {
        projectId: "PROJECTID",
        element: () => mockElement,
        configPanelElement: () => mockConfigElement,
        callbacks: {
            afterRender: () => {},
            pushData: () => {},
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: mockRenderFun,
        messages,
    };

    function createComponent(props = defaultProps) {
        return new PluggableWaterfallChart(props as unknown as IVisConstruct);
    }

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    it("should create visualization", () => {
        const visualization = createComponent();

        expect(visualization).toBeTruthy();
    });

    it("should return reference point with multi measures", async () => {
        const waterfall = createComponent();

        const extendedReferencePoint = await waterfall.getExtendedReferencePoint(
            multipleMetricsNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with one measure, one view attribute", async () => {
        const waterfall = createComponent();

        const extendedReferencePoint = await waterfall.getExtendedReferencePoint(
            onePrimaryMetricAndOneViewByRefPoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point after switching from Geo Chart", async () => {
        const waterfall = createComponent();

        const extendedReferencePoint = await waterfall.getExtendedReferencePoint(
            simpleGeoPushpinReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should accept one first attribute on the view bucket", async () => {
        const waterfall = createComponent();

        const extendedReferencePoint = await waterfall.getExtendedReferencePoint({
            buckets: [
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[0]],
                },
                {
                    localIdentifier: "view",
                    items: attributeItems,
                },
            ],
            filters: {
                localIdentifier: "filters",
                items: [overTimeComparisonDateItem],
            },
        });

        expect(extendedReferencePoint.buckets).toEqual([
            {
                localIdentifier: "measures",
                items: [masterMeasureItems[0]],
            },
            {
                localIdentifier: "view",
                items: [attributeItems[0]],
            },
        ]);
    });

    describe("Arithmetic measures", () => {
        it("should accept AM when there are multi measures", async () => {
            const waterfall = createComponent();

            const extendedReferencePoint = await waterfall.getExtendedReferencePoint({
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [masterMeasureItems[0], masterMeasureItems[1], arithmeticMeasureItems[0]],
                    },
                ],
                filters: {
                    localIdentifier: "filters",
                    items: [overTimeComparisonDateItem],
                },
            });

            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[0], masterMeasureItems[1], arithmeticMeasureItems[0]],
                },
                {
                    localIdentifier: "view",
                    items: [],
                },
            ]);
        });
    });

    describe("Over Time Comparison", () => {
        it("should return reference point containing uiConfig with no supported comparison types", async () => {
            const component = createComponent();

            const extendedReferencePoint = await component.getExtendedReferencePoint(emptyReferencePoint);

            expect(extendedReferencePoint.uiConfig!.supportedOverTimeComparisonTypes).toEqual([]);
        });
    });

    describe("`renderVisualization` and `renderConfigurationPanel`", () => {
        it("should mount on the element defined by the callback", () => {
            const visualization = createComponent();

            visualization.update({ messages }, insightWithSingleMeasure, {}, executionFactory);

            // 1st call for rendering element
            // 2nd call for rendering config panel
            expect(mockRenderFun).toHaveBeenCalledTimes(2);
            expect(getLastRenderEl(mockRenderFun, mockElement)).toBeDefined();
            expect(getLastRenderEl(mockRenderFun, mockConfigElement)).toBeDefined();
        });
    });

    describe("total measures", () => {
        it("should set the total measures value if there is any measure is total", async () => {
            const waterfall = createComponent();

            const extendedReferencePoint = await waterfall.getExtendedReferencePoint({
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            masterMeasureItems[0],
                            {
                                ...masterMeasureItems[1],
                                isTotalMeasure: true,
                            },
                        ],
                    },
                ],
                filters: {
                    localIdentifier: "filters",
                    items: [overTimeComparisonDateItem],
                },
            });

            expect(extendedReferencePoint.properties!.controls!["total"].measures).toEqual([
                masterMeasureItems[1].localIdentifier,
            ]);
        });

        it("should set the total measures value is empty if there is only one measure in the bucket items", async () => {
            const waterfall = createComponent();

            const extendedReferencePoint = await waterfall.getExtendedReferencePoint({
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [masterMeasureItems[0]],
                    },
                ],
                filters: {
                    localIdentifier: "filters",
                    items: [overTimeComparisonDateItem],
                },
                properties: {
                    controls: {
                        total: { measures: ["m1"] },
                    },
                },
            });

            expect(extendedReferencePoint.properties!.controls!["total"].measures).toEqual([]);
        });
    });
});
