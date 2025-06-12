// (C) 2019-2022 GoodData Corporation
import noop from "lodash/noop.js";
import { DefaultLocale } from "@gooddata/sdk-ui";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { PluggablePieChart } from "../PluggablePieChart.js";

import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks.js";
import { IBucketOfFun } from "../../../../interfaces/Visualization.js";
import * as testMocks from "../../../../tests/mocks/testMocks.js";
import { getLastRenderEl } from "../../tests/testHelpers.js";
import { describe, it, expect, vi, afterEach } from "vitest";

describe("PluggablePieChart", () => {
    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();
    const executionFactory = dummyBackend().workspace("PROJECTID").execution();
    const defaultProps = {
        locale: DefaultLocale,
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
        return new PluggablePieChart(props);
    }

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    it("should create visualization", () => {
        const visualization = createComponent();

        expect(visualization).toBeTruthy();
    });

    it("should return reference point with only one metric and one category and only valid filters", async () => {
        const pieChart = createComponent();

        const extendedReferencePoint = await pieChart.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with multiple metrics and no category", async () => {
        const pieChart = createComponent();

        const extendedReferencePoint = await pieChart.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with one metric and no category", async () => {
        const pieChart = createComponent();

        const extendedReferencePoint = await pieChart.getExtendedReferencePoint(
            referencePointMocks.oneMetricNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with one metric and one attribute from stack", async () => {
        const pieChart = createComponent();

        const extendedReferencePoint = await pieChart.getExtendedReferencePoint(
            referencePointMocks.oneMetricOneStackReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    describe("Arithmetic measures", () => {
        it("should skip arithmetic measures that cannot be placed together with their operands", async () => {
            const pieChart = createComponent();
            const originalRefPoint =
                referencePointMocks.firstMeasureArithmeticAlongWithAttributeReferencePoint;

            const extendedReferencePoint = await pieChart.getExtendedReferencePoint(originalRefPoint);

            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [originalRefPoint.buckets[0].items[1]],
                },
                {
                    localIdentifier: "view",
                    items: originalRefPoint.buckets[1].items,
                },
            ];

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        });

        it("should preserve arithmetic measures if there is no attribute so we keep all measures", async () => {
            const pieChart = createComponent();
            const originalRefPoint = referencePointMocks.firstMeasureArithmeticNoAttributeReferencePoint;

            const extendedReferencePoint = await pieChart.getExtendedReferencePoint(originalRefPoint);

            expect(extendedReferencePoint.buckets).toEqual(originalRefPoint.buckets);
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
                referencePointMocks.mixOfMeasuresWithDerivedAndArithmeticFromDerivedPieReferencePoint,
            );
            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [
                        referencePointMocks.masterMeasureItems[0],
                        referencePointMocks.masterMeasureItems[1],
                        referencePointMocks.arithmeticMeasureItems[0],
                        referencePointMocks.arithmeticMeasureItems[1],
                    ],
                },
                {
                    localIdentifier: "view",
                    items: [],
                },
            ]);
        });
    });

    describe("Sort config", () => {
        it("should create sort config with sorting supported but disabled when there is no view by attribute", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
            );

            expect(sortConfig.supported).toBeTruthy();
            expect(sortConfig.disabled).toBeTruthy();
        });

        it("should create sort config with sorting supported but disabled when there is no measure", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.mixOfMeasuresWithDerivedAndArithmeticFromDerivedAreaReferencePoint,
            );

            expect(sortConfig.supported).toBeTruthy();
            expect(sortConfig.disabled).toBeTruthy();
        });

        it("should provide measure sort as default sort, measure sort as available sorts for 1M + 1 VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.simpleStackedWithoutPropertiesReferencePoint,
            );

            expect(sortConfig).toMatchSnapshot();
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
