// (C) 2023-2025 GoodData Corporation
import noop from "lodash/noop.js";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { describe, it, expect, vi, afterEach } from "vitest";

import { PluggableWaterfallChart } from "../PluggableWaterfallChart.js";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks.js";
import * as testMocks from "../../../../tests/mocks/testMocks.js";
import { getLastRenderEl } from "../../tests/testHelpers.js";
import { IVisConstruct } from "src/internal/interfaces/Visualization.js";

describe("PluggableWaterfallChart", () => {
    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();
    const executionFactory = dummyBackend().workspace("PROJECTID").execution();
    const defaultProps = {
        projectId: "PROJECTID",
        element: () => mockElement,
        configPanelElement: () => mockConfigElement,
        callbacks: {
            afterRender: noop,
            pushData: noop,
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: mockRenderFun,
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
            referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with one measure, one view attribute", async () => {
        const waterfall = createComponent();

        const extendedReferencePoint = await waterfall.getExtendedReferencePoint(
            referencePointMocks.onePrimaryMetricAndOneViewByRefPoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point after switching from Geo Chart", async () => {
        const waterfall = createComponent();

        const extendedReferencePoint = await waterfall.getExtendedReferencePoint(
            referencePointMocks.simpleGeoPushpinReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should accept one first attribute on the view bucket", async () => {
        const waterfall = createComponent();

        const extendedReferencePoint = await waterfall.getExtendedReferencePoint({
            buckets: [
                {
                    localIdentifier: "measures",
                    items: [referencePointMocks.masterMeasureItems[0]],
                },
                {
                    localIdentifier: "view",
                    items: referencePointMocks.attributeItems,
                },
            ],
            filters: {
                localIdentifier: "filters",
                items: [referencePointMocks.overTimeComparisonDateItem],
            },
        });

        expect(extendedReferencePoint.buckets).toEqual([
            {
                localIdentifier: "measures",
                items: [referencePointMocks.masterMeasureItems[0]],
            },
            {
                localIdentifier: "view",
                items: [referencePointMocks.attributeItems[0]],
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
                        items: [
                            referencePointMocks.masterMeasureItems[0],
                            referencePointMocks.masterMeasureItems[1],
                            referencePointMocks.arithmeticMeasureItems[0],
                        ],
                    },
                ],
                filters: {
                    localIdentifier: "filters",
                    items: [referencePointMocks.overTimeComparisonDateItem],
                },
            });

            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [
                        referencePointMocks.masterMeasureItems[0],
                        referencePointMocks.masterMeasureItems[1],
                        referencePointMocks.arithmeticMeasureItems[0],
                    ],
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

            const extendedReferencePoint = await component.getExtendedReferencePoint(
                referencePointMocks.emptyReferencePoint,
            );

            expect(extendedReferencePoint.uiConfig.supportedOverTimeComparisonTypes).toEqual([]);
        });
    });

    describe("`renderVisualization` and `renderConfigurationPanel`", () => {
        it("should mount on the element defined by the callback", () => {
            const visualization = createComponent();

            visualization.update({}, testMocks.insightWithSingleMeasure, {}, executionFactory);

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
                            referencePointMocks.masterMeasureItems[0],
                            {
                                ...referencePointMocks.masterMeasureItems[1],
                                isTotalMeasure: true,
                            },
                        ],
                    },
                ],
                filters: {
                    localIdentifier: "filters",
                    items: [referencePointMocks.overTimeComparisonDateItem],
                },
            });

            expect(extendedReferencePoint.properties.controls.total.measures).toEqual([
                referencePointMocks.masterMeasureItems[1].localIdentifier,
            ]);
        });

        it("should set the total measures value is empty if there is only one measure in the bucket items", async () => {
            const waterfall = createComponent();

            const extendedReferencePoint = await waterfall.getExtendedReferencePoint({
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [referencePointMocks.masterMeasureItems[0]],
                    },
                ],
                filters: {
                    localIdentifier: "filters",
                    items: [referencePointMocks.overTimeComparisonDateItem],
                },
                properties: {
                    controls: {
                        total: { measures: ["m1"] },
                    },
                },
            });

            expect(extendedReferencePoint.properties.controls.total.measures).toEqual([]);
        });
    });
});
