// (C) 2019-2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { type IBucketOfFun, type IVisConstruct } from "../../../../interfaces/Visualization.js";
import {
    arithmeticMeasureItems,
    emptyReferencePoint,
    firstMeasureArithmeticAlongWithAttributeReferencePoint,
    firstMeasureArithmeticNoAttributeReferencePoint,
    masterMeasureItems,
    mixOfMeasuresWithDerivedAndArithmeticFromDerivedAreaReferencePoint,
    mixOfMeasuresWithDerivedAndArithmeticFromDerivedPieReferencePoint,
    multipleMetricsAndCategoriesReferencePoint,
    multipleMetricsNoCategoriesReferencePoint,
    oneMetricNoCategoriesReferencePoint,
    oneMetricOneStackReferencePoint,
    simpleStackedWithoutPropertiesReferencePoint,
} from "../../../../tests/mocks/referencePointMocks.js";
import { insightWithSingleMeasure } from "../../../../tests/mocks/testMocks.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../../utils/translations.js";
import { getLastRenderEl } from "../../tests/pluggableVisualizations.test.helpers.js";
import { PluggablePieChart } from "../PluggablePieChart.js";

describe("PluggablePieChart", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();
    const executionFactory = dummyBackend().workspace("PROJECTID").execution();
    const defaultProps = {
        locale: DEFAULT_LANGUAGE,
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
        return new PluggablePieChart(props as unknown as IVisConstruct);
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
            multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with multiple metrics and no category", async () => {
        const pieChart = createComponent();

        const extendedReferencePoint = await pieChart.getExtendedReferencePoint(
            multipleMetricsNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with one metric and no category", async () => {
        const pieChart = createComponent();

        const extendedReferencePoint = await pieChart.getExtendedReferencePoint(
            oneMetricNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with one metric and one attribute from stack", async () => {
        const pieChart = createComponent();

        const extendedReferencePoint = await pieChart.getExtendedReferencePoint(
            oneMetricOneStackReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    describe("Arithmetic measures", () => {
        it("should skip arithmetic measures that cannot be placed together with their operands", async () => {
            const pieChart = createComponent();
            const originalRefPoint = firstMeasureArithmeticAlongWithAttributeReferencePoint;

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
            const originalRefPoint = firstMeasureArithmeticNoAttributeReferencePoint;

            const extendedReferencePoint = await pieChart.getExtendedReferencePoint(originalRefPoint);

            expect(extendedReferencePoint.buckets).toEqual(originalRefPoint.buckets);
        });
    });

    describe("Over Time Comparison", () => {
        it("should return reference point containing uiConfig with no supported comparison types", async () => {
            const component = createComponent();

            const extendedReferencePoint = await component.getExtendedReferencePoint(emptyReferencePoint);

            expect(extendedReferencePoint.uiConfig!.supportedOverTimeComparisonTypes).toEqual([]);
        });

        it("should remove all derived measures and arithmetic measures created from derived measures", async () => {
            const component = createComponent();

            const extendedReferencePoint = await component.getExtendedReferencePoint(
                mixOfMeasuresWithDerivedAndArithmeticFromDerivedPieReferencePoint,
            );
            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [
                        masterMeasureItems[0],
                        masterMeasureItems[1],
                        arithmeticMeasureItems[0],
                        arithmeticMeasureItems[1],
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

            const sortConfig = await chart.getSortConfig(multipleMetricsNoCategoriesReferencePoint);

            expect(sortConfig.supported).toBeTruthy();
            expect(sortConfig.disabled).toBeTruthy();
        });

        it("should create sort config with sorting supported but disabled when there is no measure", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                mixOfMeasuresWithDerivedAndArithmeticFromDerivedAreaReferencePoint,
            );

            expect(sortConfig.supported).toBeTruthy();
            expect(sortConfig.disabled).toBeTruthy();
        });

        it("should provide measure sort as default sort, measure sort as available sorts for 1M + 1 VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(simpleStackedWithoutPropertiesReferencePoint);

            expect(sortConfig).toMatchSnapshot();
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
});
