// (C) 2019-2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { AXIS } from "../../../../constants/axis.js";
import { type IReferencePoint, type IVisConstruct } from "../../../../interfaces/Visualization.js";
import {
    emptyReferencePoint,
    justViewByReferencePoint,
    multipleMetricsAndCategoriesReferencePoint,
    multipleMetricsNoCategoriesReferencePoint,
    oneMetricAndCategoryAndStackReferencePoint,
    oneMetricAndManyCategoriesAndOneStackRefPoint,
    oneMetricAndTwoCategoriesReferencePoint,
    oneMetricNoCategoriesReferencePoint,
    oneMetricOneCategory,
    oneMetricReferencePoint,
    samePeriodPreviousYearRefPoint,
    simpleStackedReferencePoint,
    twoMetricAndOneCategoryRefPoint,
    twoMetricAndTwoCategoriesRefPoint,
    twoStackedMetricAndOneCategoryRefPoint,
    twoStackedMetricAndTwoCategoriesRefPoint,
} from "../../../../tests/mocks/referencePointMocks.js";
import { insightWithSingleMeasure } from "../../../../tests/mocks/testMocks.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../../utils/translations.js";
import { getLastRenderEl } from "../../tests/pluggableVisualizations.test.helpers.js";
import { PluggableBarChart } from "../PluggableBarChart.js";

describe("PluggableBarChart", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();
    const backend = dummyBackend();
    const executionFactory = backend.workspace("PROJECTID").execution();
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
        return new PluggableBarChart(props);
    }

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    it("should return reference point with uiConfig containing supportedOverTimeComparisonTypes", async () => {
        const barChart = createComponent();

        const extendedReferencePoint = await barChart.getExtendedReferencePoint(oneMetricReferencePoint);

        expect(extendedReferencePoint).toMatchObject(
            expect.objectContaining({
                uiConfig: expect.objectContaining({
                    supportedOverTimeComparisonTypes: [
                        OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                        OverTimeComparisonTypes.PREVIOUS_PERIOD,
                    ],
                }),
            }),
        );
    });

    it("should enable stack attribute bucket", async () => {
        const barChart = createComponent();

        const extendedReferencePoint = await barChart.getExtendedReferencePoint(oneMetricReferencePoint);

        expect(extendedReferencePoint).toMatchObject(
            expect.objectContaining({
                uiConfig: expect.objectContaining({
                    buckets: expect.objectContaining({
                        stack: expect.objectContaining({ canAddItems: true }),
                    }),
                }),
            }),
        );
    });

    it("should disable stack attribute bucket for one measure and one aggregated measure", async () => {
        const barChart = createComponent();

        const extendedReferencePoint = await barChart.getExtendedReferencePoint(
            samePeriodPreviousYearRefPoint,
        );

        expect(extendedReferencePoint).toMatchObject(
            expect.objectContaining({
                uiConfig: expect.objectContaining({
                    buckets: expect.objectContaining({
                        stack: expect.objectContaining({ canAddItems: false }),
                    }),
                }),
            }),
        );
    });

    it("should disable stack attribute bucket for two measures", async () => {
        const barChart = createComponent();

        const extendedReferencePoint = await barChart.getExtendedReferencePoint(
            multipleMetricsNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchObject(
            expect.objectContaining({
                uiConfig: expect.objectContaining({
                    buckets: expect.objectContaining({
                        stack: expect.objectContaining({ canAddItems: false }),
                    }),
                }),
            }),
        );
    });

    describe("Over Time Comparison", () => {
        it("should return reference point containing uiConfig with PP, SP supported comparison types", async () => {
            const component = createComponent();

            const extendedReferencePoint = await component.getExtendedReferencePoint(emptyReferencePoint);

            expect(extendedReferencePoint.uiConfig!.supportedOverTimeComparisonTypes).toEqual([
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            ]);
        });
    });

    describe("Dual Axes", () => {
        it("should NOT add measure identifier into properties which are NOT set to secondary axis", async () => {
            const chart = createComponent(defaultProps);

            const extendedReferencePoint = await chart.getExtendedReferencePoint(
                oneMetricAndCategoryAndStackReferencePoint,
            );

            const measures = extendedReferencePoint?.properties?.controls?.["secondary_xaxis"].measures;
            const axis = extendedReferencePoint?.uiConfig?.axis;
            expect(measures).toBeUndefined();
            expect(axis).toBeUndefined();
        });

        it("should add measures identifiers into properties which are set to secondary axis", async () => {
            const chart = createComponent(defaultProps);

            const extendedReferencePoint = await chart.getExtendedReferencePoint(
                multipleMetricsAndCategoriesReferencePoint,
            );

            const measures = extendedReferencePoint?.properties?.controls?.["secondary_xaxis"].measures;
            const axis = extendedReferencePoint?.uiConfig?.axis;
            expect(measures).toEqual(["m3", "m4"]);
            expect(axis).toEqual(AXIS.DUAL);
        });
    });

    describe("Sort config", () => {
        it("should create sort config with sorting supported but disabled when there is no view by attribute", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(oneMetricNoCategoriesReferencePoint);

            expect(sortConfig.supported).toBeTruthy();
            expect(sortConfig.disabled).toBeTruthy();
        });

        it("should create sort config with sorting disabled when there is no measure", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(justViewByReferencePoint);

            expect(sortConfig.supported).toBeTruthy();
            expect(sortConfig.disabled).toBeTruthy();
        });

        it("should create sort config with sorting enabled when there is view by attribute", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(oneMetricAndCategoryAndStackReferencePoint);

            expect(sortConfig.supported).toBeTruthy();
            expect(sortConfig.disabled).toBeFalsy();
        });

        it("should provide measureSort as default sort for 1M + 1 VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(oneMetricOneCategory);

            expect(sortConfig.defaultSort).toMatchSnapshot();
        });

        it("should provide attribute area sort and measureSort as default sort for 1M + 2 VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(oneMetricAndTwoCategoriesReferencePoint);

            expect(sortConfig.defaultSort).toMatchSnapshot();
        });

        it("should provide two attribute area sorts as default sort for 1M + 2 VB + 1SB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(oneMetricAndManyCategoriesAndOneStackRefPoint);

            expect(sortConfig.defaultSort).toMatchSnapshot();
        });

        it("should provide measureSort by first measure as default sort for 2M + 1 VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(twoMetricAndOneCategoryRefPoint);

            expect(sortConfig.defaultSort).toMatchSnapshot();
        });

        it("should provide attribute area sort as default sort for 2 stacked M + 1 VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(twoStackedMetricAndOneCategoryRefPoint);

            expect(sortConfig.defaultSort).toMatchSnapshot();
        });

        it("should provide areaSort+measureSort by first measure as default sort for 2M + 2 VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(twoMetricAndTwoCategoriesRefPoint);

            expect(sortConfig.defaultSort).toMatchSnapshot();
        });

        it("should provide two areaSorts as default sort for 2 stacked M + 2 VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(twoStackedMetricAndTwoCategoriesRefPoint);

            expect(sortConfig.defaultSort).toMatchSnapshot();
        });

        const Scenarios: Array<[string, IReferencePoint]> = [
            ["1M + 1 VB", oneMetricOneCategory],
            ["1M + 1 VB + 1SB", simpleStackedReferencePoint],
            ["1M + 2 VB + 1SB", oneMetricAndManyCategoriesAndOneStackRefPoint],
            ["2M + 1 VB", twoMetricAndOneCategoryRefPoint],
            ["2 stacked M + 1 VB", twoStackedMetricAndOneCategoryRefPoint],
            ["2M + 2 VB", twoMetricAndTwoCategoriesRefPoint],
            ["2 stacked M + 2 VB", twoStackedMetricAndTwoCategoriesRefPoint],
        ];

        it.each(Scenarios)(
            "should return valid available sorts for %s",
            async (_name, referencePointMock) => {
                const chart = createComponent(defaultProps);

                const sortConfig = await chart.getSortConfig(referencePointMock);

                expect(sortConfig.availableSorts).toMatchSnapshot();
            },
        );
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
