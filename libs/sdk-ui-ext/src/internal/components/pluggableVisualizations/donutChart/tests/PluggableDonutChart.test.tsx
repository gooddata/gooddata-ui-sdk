// (C) 2019-2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { type IBucketOfFun, type IVisConstruct } from "../../../../interfaces/Visualization.js";
import {
    emptyReferencePoint,
    firstMeasureArithmeticAlongWithAttributeReferencePoint,
    firstMeasureArithmeticNoAttributeReferencePoint,
    multipleMetricsAndCategoriesReferencePoint,
    multipleMetricsNoCategoriesReferencePoint,
    oneMetricNoCategoriesReferencePoint,
} from "../../../../tests/mocks/referencePointMocks.js";
import { insightWithSingleMeasure } from "../../../../tests/mocks/testMocks.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../../utils/translations.js";
import { getLastRenderEl } from "../../tests/pluggableVisualizations.test.helpers.js";
import { PluggableDonutChart } from "../PluggableDonutChart.js";

describe("PluggableDonutChart", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();
    const executionFactory = dummyBackend().workspace("PROJECTID").execution();
    const defaultProps: IVisConstruct = {
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
    } as unknown as IVisConstruct;

    function createComponent(props = defaultProps) {
        return new PluggableDonutChart(props);
    }

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    it("should create visualization", () => {
        const visualization = createComponent();

        expect(visualization).toBeTruthy();
    });

    it("should return reference point with only one metric and one category and only valid filters", async () => {
        const donutChart = createComponent();

        const extendedReferencePoint = await donutChart.getExtendedReferencePoint(
            multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with multiple metrics and no category", async () => {
        const donutChart = createComponent();

        const extendedReferencePoint = await donutChart.getExtendedReferencePoint(
            multipleMetricsNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with one metric and no category", async () => {
        const donutChart = createComponent();

        const extendedReferencePoint = await donutChart.getExtendedReferencePoint(
            oneMetricNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    describe("Arithmetic measures", () => {
        it("should skip arithmetic measures that cannot be placed together with their operands", async () => {
            const donutChart = createComponent();
            const originalRefPoint = firstMeasureArithmeticAlongWithAttributeReferencePoint;

            const extendedReferencePoint = await donutChart.getExtendedReferencePoint(originalRefPoint);

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
            const donutChart = createComponent();

            const extendedReferencePoint = await donutChart.getExtendedReferencePoint(
                firstMeasureArithmeticNoAttributeReferencePoint,
            );

            expect(extendedReferencePoint.buckets).toEqual(
                firstMeasureArithmeticNoAttributeReferencePoint.buckets,
            );
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
});
