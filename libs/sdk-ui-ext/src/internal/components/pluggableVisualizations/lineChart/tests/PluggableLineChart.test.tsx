// (C) 2019 GoodData Corporation
import noop from "lodash/noop";
import get from "lodash/get";
import { IBucketOfFun, IFilters } from "../../../../interfaces/Visualization";
import { PluggableLineChart } from "../PluggableLineChart";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import * as uiConfigMocks from "../../../../tests/mocks/uiConfigMocks";
import { AXIS } from "../../../../constants/axis";
import { LINE_CHART_SUPPORTED_PROPERTIES } from "../../../../constants/supportedProperties";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

jest.mock("react-dom", () => {
    const renderObject = {
        render: () => {
            return;
        }, // spy on render
    };
    return {
        render: renderObject.render,
        unmountComponentAtNode: () => {
            return;
        },
        renderObject,
    };
});

describe("PluggableLineChart", () => {
    const defaultProps = {
        projectId: "PROJECTID",
        element: "body",
        configPanelElement: null as string,
        callbacks: {
            afterRender: noop,
            pushData: noop,
            onError: noop,
            onLoadingChanged: noop,
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: noop,
    };

    function createComponent(props = defaultProps) {
        return new PluggableLineChart(props);
    }

    afterAll(() => {
        document.clear();
    });

    it("should reuse all measures, only one category and no stacks", async () => {
        const lineChart = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "trend",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[1].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "segment",
                items: [],
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.filters.items.slice(0, 1),
        };

        const expectedProperties = {
            controls: {
                secondary_yaxis: {
                    measures: ["m3", "m4"],
                },
            },
        };

        const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: {
                ...uiConfigMocks.multipleMetricsAndCategoriesLineUiConfig,
                axis: "dual",
            },
            properties: expectedProperties,
        });
    });

    it("should reuse one measure, only one category and one category as stack", async () => {
        const lineChart = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.oneMetricAndManyCategoriesReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "trend",
                items: referencePointMocks.oneMetricAndManyCategoriesReferencePoint.buckets[1].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "segment",
                items: referencePointMocks.oneMetricAndManyCategoriesReferencePoint.buckets[1].items.slice(
                    1,
                    2,
                ),
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: referencePointMocks.oneMetricAndManyCategoriesReferencePoint.filters.items.slice(0, 2),
        };

        const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
            referencePointMocks.oneMetricAndManyCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: uiConfigMocks.oneMetricAndManyCategoriesLineUiConfig,
            properties: {},
        });
    });

    it("should return reference point with Date in categories even it was as second item", async () => {
        const lineChart = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.dateAsSecondCategoryReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "trend",
                items: referencePointMocks.dateAsSecondCategoryReferencePoint.buckets[1].items.slice(0, 1),
            },
            {
                localIdentifier: "segment",
                items: referencePointMocks.dateAsSecondCategoryReferencePoint.buckets[1].items.slice(1, 2),
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };

        const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
            referencePointMocks.dateAsSecondCategoryReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: uiConfigMocks.dateAsSecondCategoryLineUiConfig,
            properties: {},
        });
    });

    it("should return reference point with one category and one stack", async () => {
        const lineChart = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.oneMetricAndCategoryAndStackReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "trend",
                items: referencePointMocks.oneMetricAndCategoryAndStackReferencePoint.buckets[1].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "segment",
                items: referencePointMocks.oneMetricAndCategoryAndStackReferencePoint.buckets[2].items.slice(
                    0,
                    1,
                ),
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };

        const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
            referencePointMocks.oneMetricAndCategoryAndStackReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: uiConfigMocks.oneMetricAndCategoryAndStackLineUiConfig,
            properties: {},
        });
    });

    it("should return reference point when no categories and only stacks", async () => {
        const lineChart = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.oneStackAndNoCategoriesReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "trend",
                items: [],
            },
            {
                localIdentifier: "segment",
                items: referencePointMocks.oneStackAndNoCategoriesReferencePoint.buckets[2].items.slice(0, 1),
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };

        const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
            referencePointMocks.oneStackAndNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: uiConfigMocks.oneStackAndNoCategoriesLineUiConfig,
            properties: {},
        });
    });

    it("should cut out measures tail when getting nM 0Vb 1Sb", async () => {
        const lineChart = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.multipleMetricsOneStackByReferencePoint.buckets[0].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "trend",
                items: [],
            },
            {
                localIdentifier: "segment",
                items: referencePointMocks.multipleMetricsOneStackByReferencePoint.buckets[2].items,
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };
        const expectedProperties = {};

        const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsOneStackByReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: uiConfigMocks.oneStackAndNoCategoriesLineUiConfig,
            properties: expectedProperties,
        });
    });

    it("should handle wrong order of buckets in reference point", async () => {
        const lineChart = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.wrongBucketsOrderReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "trend",
                items: referencePointMocks.wrongBucketsOrderReferencePoint.buckets[2].items,
            },
            {
                localIdentifier: "segment",
                items: referencePointMocks.wrongBucketsOrderReferencePoint.buckets[1].items,
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };

        const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
            referencePointMocks.wrongBucketsOrderInLineReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: uiConfigMocks.oneMetricAndManyCategoriesLineUiConfig,
            properties: {},
        });
    });

    it(
        'should remove derived measure and place date to "trend" and first of other attributes to "segment" ' +
            "when single measure with comparison is applied and date is first attribute",
        async () => {
            const lineChart = createComponent();

            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [
                        referencePointMocks.samePeriodPreviousYearAndAttributesRefPoint.buckets[0].items[0],
                    ],
                },
                {
                    localIdentifier: "trend",
                    items: [
                        referencePointMocks.samePeriodPreviousYearAndAttributesRefPoint.buckets[1].items[0],
                    ],
                },
                {
                    localIdentifier: "segment",
                    items: [
                        referencePointMocks.samePeriodPreviousYearAndAttributesRefPoint.buckets[1].items[1],
                    ],
                },
            ];

            const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
                referencePointMocks.samePeriodPreviousYearAndAttributesRefPoint,
            );

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        },
    );

    // should accept ref point with one measure with derived and date after other attributes
    it(
        'should remove derived measure and  place date to "trend" and first of other attributes to "segment" ' +
            "when single measure with comparison is applied and date is placed after other attributes",
        async () => {
            const lineChart = createComponent();

            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [referencePointMocks.measureWithDateAfterOtherAttributes.buckets[0].items[0]],
                },
                {
                    localIdentifier: "trend",
                    items: [referencePointMocks.measureWithDateAfterOtherAttributes.buckets[1].items[2]],
                },
                {
                    localIdentifier: "segment",
                    items: [referencePointMocks.measureWithDateAfterOtherAttributes.buckets[1].items[0]],
                },
            ];

            const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
                referencePointMocks.measureWithDateAfterOtherAttributes,
            );

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        },
    );

    it('should disable possibility to add items to "segment by" for more than one measure in measures bucket', async () => {
        const lineChart = createComponent();

        const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
            referencePointMocks.twoMeasureBucketsReferencePoint,
        );

        expect(extendedReferencePoint).toMatchObject(
            expect.objectContaining({
                uiConfig: expect.objectContaining({
                    buckets: expect.objectContaining({
                        segment: expect.objectContaining({ canAddItems: false }),
                    }),
                }),
            }),
        );
    });

    it(
        'should enable possibility to add items to "segment by" when there is already something in stack ' +
            "bucket so item can be replaced by drag even when more than 2 measures present in measures bucket",
        async () => {
            const lineChart = createComponent();

            const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
                referencePointMocks.attributeInStackReferencePoint,
            );

            expect(extendedReferencePoint).toMatchObject(
                expect.objectContaining({
                    uiConfig: expect.objectContaining({
                        buckets: expect.objectContaining({
                            segment: expect.objectContaining({ canAddItems: true }),
                        }),
                    }),
                }),
            );
        },
    );

    it("should allow only one date attribute", async () => {
        const lineChart = createComponent();
        const referencePoint = referencePointMocks.dateAttributeOnRowAndColumnReferencePoint;

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: [referencePoint.buckets[0].items[0]],
            },
            {
                localIdentifier: "trend",
                items: [referencePoint.buckets[1].items[0]],
            },
            {
                localIdentifier: "segment",
                items: [],
            },
        ];

        const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
            referencePointMocks.dateAttributeOnRowAndColumnReferencePoint,
        );

        expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
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
            const lineChart = createComponent(defaultProps);

            const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
                referencePointMocks.oneMetricAndCategoryAndStackReferencePoint,
            );

            const measures = get(extendedReferencePoint, "properties.controls.secondary_yaxis.measures");
            const axis = get(extendedReferencePoint, "uiConfig.axis");
            expect(measures).toBeUndefined();
            expect(axis).toBeUndefined();
        });

        it("should add measures identifiers into properties which are set to secondary axis", async () => {
            const lineChart = createComponent(defaultProps);

            const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
                referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
            );

            const measures = get(extendedReferencePoint, "properties.controls.secondary_yaxis.measures");
            const axis = get(extendedReferencePoint, "uiConfig.axis");
            expect(measures).toEqual(["m3", "m4"]);
            expect(axis).toEqual(AXIS.DUAL);
        });

        it("should update supported properties list base on axis type", async () => {
            const mockProps = {
                ...defaultProps,
                pushData: jest.fn(),
            };
            const chart = createComponent(mockProps);

            await chart.getExtendedReferencePoint(
                referencePointMocks.oneMetricAndCategoryAndStackReferencePoint,
            );
            expect(get(chart, "supportedPropertiesList")).toEqual(
                LINE_CHART_SUPPORTED_PROPERTIES[AXIS.PRIMARY],
            );

            await chart.getExtendedReferencePoint(
                referencePointMocks.measuresOnSecondaryAxisAndAttributeReferencePoint,
            );
            expect(get(chart, "supportedPropertiesList")).toEqual(
                LINE_CHART_SUPPORTED_PROPERTIES[AXIS.SECONDARY],
            );

            await chart.getExtendedReferencePoint(
                referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
            );
            expect(get(chart, "supportedPropertiesList")).toEqual(LINE_CHART_SUPPORTED_PROPERTIES[AXIS.DUAL]);
        });
    });
});
