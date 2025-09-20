// (C) 2019-2025 GoodData Corporation
import { noop } from "lodash-es";
import { IVisConstruct } from "src/internal/interfaces/Visualization.js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks.js";
import * as testMocks from "../../../../tests/mocks/testMocks.js";
import { getLastRenderEl } from "../../tests/testHelpers.js";
import { PluggableScatterPlot } from "../PluggableScatterPlot.js";

describe("PluggableScatterPlot", () => {
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
        return new PluggableScatterPlot(props as unknown as IVisConstruct);
    }

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    it("should create visualization", () => {
        const visualization = createComponent();

        expect(visualization).toBeTruthy();
    });

    it("should return reference point with primary and secondary measure, one category and only valid filters", async () => {
        const scatterPlot = createComponent();

        const extendedReferencePoint = await scatterPlot.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with two measures and no attribute", async () => {
        const scatterPlot = createComponent();

        const extendedReferencePoint = await scatterPlot.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with one secondary measure and one attribute", async () => {
        const scatterPlot = createComponent();

        const extendedReferencePoint = await scatterPlot.getExtendedReferencePoint(
            referencePointMocks.secondaryMeasureReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with primary measure and one attribute", async () => {
        const scatterPlot = createComponent();

        const extendedReferencePoint = await scatterPlot.getExtendedReferencePoint(
            referencePointMocks.oneMetricAndManyCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point after switching from Geo Chart", async () => {
        const scatterPlot = createComponent();

        const extendedReferencePoint = await scatterPlot.getExtendedReferencePoint(
            referencePointMocks.simpleGeoPushpinReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    describe("Arithmetic measures", () => {
        it("should skip AM that does not fit into two measure bucket item slots", async () => {
            const scatterPlot = createComponent();

            const extendedReferencePoint = await scatterPlot.getExtendedReferencePoint({
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            referencePointMocks.arithmeticMeasureItems[0],
                            referencePointMocks.masterMeasureItems[0],
                            referencePointMocks.masterMeasureItems[1],
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
                    items: [referencePointMocks.masterMeasureItems[0]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [referencePointMocks.masterMeasureItems[1]],
                },
                {
                    localIdentifier: "attribute",
                    items: [],
                },
                {
                    localIdentifier: "segment",
                    items: [],
                },
            ]);
        });

        it("should accept arithmetic measure when it has the same measure in both operands", async () => {
            const scatterPlot = createComponent();

            const extendedReferencePoint = await scatterPlot.getExtendedReferencePoint({
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            referencePointMocks.arithmeticMeasureItems[2],
                            referencePointMocks.masterMeasureItems[0],
                            referencePointMocks.masterMeasureItems[1],
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
                    items: [referencePointMocks.arithmeticMeasureItems[2]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [referencePointMocks.masterMeasureItems[0]],
                },
                {
                    localIdentifier: "attribute",
                    items: [],
                },
                {
                    localIdentifier: "segment",
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

        it("should remove all derived measures and arithmetic measures created from derived measures", async () => {
            const component = createComponent();

            const extendedReferencePoint = await component.getExtendedReferencePoint(
                referencePointMocks.mixOfMeasuresWithDerivedAndArithmeticFromDerivedScatterReferencePoint,
            );
            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [referencePointMocks.masterMeasureItems[0]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [referencePointMocks.masterMeasureItems[1]],
                },
                {
                    localIdentifier: "attribute",
                    items: [],
                },
                {
                    localIdentifier: "segment",
                    items: [],
                },
            ]);
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
});
