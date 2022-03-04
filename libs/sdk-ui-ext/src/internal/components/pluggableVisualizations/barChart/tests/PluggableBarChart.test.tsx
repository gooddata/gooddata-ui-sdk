// (C) 2019-2022 GoodData Corporation
import noop from "lodash/noop";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { PluggableBarChart } from "../PluggableBarChart";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import { AXIS } from "../../../../constants/axis";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IReferencePoint } from "../../../../interfaces/Visualization";

describe("PluggableBarChart", () => {
    const defaultProps = {
        projectId: "PROJECTID",
        element: "body",
        configPanelElement: null as string,
        callbacks: {
            afterRender: noop,
            pushData: noop,
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: noop,
    };

    function createComponent(props = defaultProps) {
        return new PluggableBarChart(props);
    }

    it("should return reference point with uiConfig containing supportedOverTimeComparisonTypes", async () => {
        const barChart = createComponent();

        const extendedReferencePoint = await barChart.getExtendedReferencePoint(
            referencePointMocks.oneMetricReferencePoint,
        );

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

        const extendedReferencePoint = await barChart.getExtendedReferencePoint(
            referencePointMocks.oneMetricReferencePoint,
        );

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
            referencePointMocks.samePeriodPreviousYearRefPoint,
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
            referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
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

            const extendedReferencePoint = await component.getExtendedReferencePoint(
                referencePointMocks.emptyReferencePoint,
            );

            expect(extendedReferencePoint.uiConfig.supportedOverTimeComparisonTypes).toEqual([
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            ]);
        });
    });

    describe("Dual Axes", () => {
        it("should NOT add measure identifier into properties which are NOT set to secondary axis", async () => {
            const chart = createComponent(defaultProps);

            const extendedReferencePoint = await chart.getExtendedReferencePoint(
                referencePointMocks.oneMetricAndCategoryAndStackReferencePoint,
            );

            const measures = extendedReferencePoint?.properties?.controls?.secondary_xaxis.measures;
            const axis = extendedReferencePoint?.uiConfig?.axis;
            expect(measures).toBeUndefined();
            expect(axis).toBeUndefined();
        });

        it("should add measures identifiers into properties which are set to secondary axis", async () => {
            const chart = createComponent(defaultProps);

            const extendedReferencePoint = await chart.getExtendedReferencePoint(
                referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
            );

            const measures = extendedReferencePoint?.properties?.controls?.secondary_xaxis.measures;
            const axis = extendedReferencePoint?.uiConfig?.axis;
            expect(measures).toEqual(["m3", "m4"]);
            expect(axis).toEqual(AXIS.DUAL);
        });
    });

    describe("Sort config", () => {
        it("should create sort config with sorting supported but disabled when there is no view by attribute", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.oneMetricNoCategoriesReferencePoint,
            );

            expect(sortConfig.supported).toBeTruthy();
            expect(sortConfig.disabled).toBeTruthy();
        });

        it("should create sort config with sorting disabled when there is no measure", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(referencePointMocks.justViewByReferencePoint);

            expect(sortConfig.supported).toBeTruthy();
            expect(sortConfig.disabled).toBeTruthy();
        });

        it("should create sort config with sorting enabled when there is view by attribute", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.oneMetricAndCategoryAndStackReferencePoint,
            );

            expect(sortConfig.supported).toBeTruthy();
            expect(sortConfig.disabled).toBeFalsy();
        });

        it("should provide measureSort as default sort for 1M + 1 VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(referencePointMocks.oneMetricOneCategory);

            expect(sortConfig.currentSort).toMatchSnapshot();
        });

        it("should provide attribute area sort and measureSort as default sort for 1M + 2 VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.oneMetricAndTwoCategoriesReferencePoint,
            );

            expect(sortConfig.currentSort).toMatchSnapshot();
        });

        it("should provide two attribute area sorts as default sort for 1M + 2 VB + 1SB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.oneMetricAndManyCategoriesAndOneStackRefPoint,
            );

            expect(sortConfig.currentSort).toMatchSnapshot();
        });

        it("should provide measureSort by first measure as default sort for 2M + 1 VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(referencePointMocks.twoMetricAndOneCategoryRefPoint);

            expect(sortConfig.currentSort).toMatchSnapshot();
        });

        it("should provide attribute area sort as default sort for 2 stacked M + 1 VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.twoStackedMetricAndOneCategoryRefPoint,
            );

            expect(sortConfig.currentSort).toMatchSnapshot();
        });

        it("should provide areaSort+measureSort by first measure as default sort for 2M + 2 VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.twoMetricAndTwoCategoriesRefPoint,
            );

            expect(sortConfig.currentSort).toMatchSnapshot();
        });

        it("should provide two areaSorts as default sort for 2 stacked M + 2 VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.twoStackedMetricAndTwoCategoriesRefPoint,
            );

            expect(sortConfig.currentSort).toMatchSnapshot();
        });

        const Scenarios: Array<[string, IReferencePoint]> = [
            ["1M + 1 VB", referencePointMocks.oneMetricOneCategory],
            ["1M + 1 VB + 1SB", referencePointMocks.simpleStackedReferencePoint],
            ["1M + 2 VB + 1SB", referencePointMocks.oneMetricAndManyCategoriesAndOneStackRefPoint],
            ["2M + 1 VB", referencePointMocks.twoMetricAndOneCategoryRefPoint],
            ["2 stacked M + 1 VB", referencePointMocks.twoStackedMetricAndOneCategoryRefPoint],
            ["2M + 2 VB", referencePointMocks.twoMetricAndTwoCategoriesRefPoint],
            ["2 stacked M + 2 VB", referencePointMocks.twoStackedMetricAndTwoCategoriesRefPoint],
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
});
