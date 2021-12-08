// (C) 2019-2021 GoodData Corporation
import noop from "lodash/noop";
import {
    IBucketOfFun,
    IFilters,
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
} from "../../../../interfaces/Visualization";
import { PluggableLineChart } from "../PluggableLineChart";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import * as uiConfigMocks from "../../../../tests/mocks/uiConfigMocks";
import { AXIS } from "../../../../constants/axis";
import { LINE_CHART_SUPPORTED_PROPERTIES } from "../../../../constants/supportedProperties";
import { IDrillEventIntersectionElement, OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    expectedInsightDefDepartment,
    expectedInsightDefRegion,
    intersection,
    sourceInsightDef,
    targetUri,
} from "../../treeMap/tests/getInsightWithDrillDownAppliedMock";
import { Department, Region } from "@gooddata/reference-workspace/dist/md/full";
import { IAttribute, IInsight, IInsightDefinition } from "@gooddata/sdk-model";
import { createDrillDefinition, createDrillEvent, insightDefinitionToInsight } from "../../tests/testHelpers";

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
    const defaultProps: IVisConstruct = {
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
        const referencePoint = referencePointMocks.dateAttributeOnViewAndStackReferencePoint;

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
            referencePointMocks.dateAttributeOnViewAndStackReferencePoint,
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

            const measures = extendedReferencePoint?.properties?.controls?.secondary_yaxis.measures;
            const axis = extendedReferencePoint?.uiConfig?.axis;
            expect(measures).toBeUndefined();
            expect(axis).toBeUndefined();
        });

        it("should add measures identifiers into properties which are set to secondary axis", async () => {
            const lineChart = createComponent(defaultProps);

            const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
                referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
            );

            const measures = extendedReferencePoint?.properties?.controls?.secondary_yaxis.measures;
            const axis = extendedReferencePoint?.uiConfig?.axis;
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
            // TODO avoid testing protected property
            expect((chart as any).supportedPropertiesList).toEqual(
                LINE_CHART_SUPPORTED_PROPERTIES[AXIS.PRIMARY],
            );

            await chart.getExtendedReferencePoint(
                referencePointMocks.measuresOnSecondaryAxisAndAttributeReferencePoint,
            );
            // TODO avoid testing protected property
            expect((chart as any).supportedPropertiesList).toEqual(
                LINE_CHART_SUPPORTED_PROPERTIES[AXIS.SECONDARY],
            );

            await chart.getExtendedReferencePoint(
                referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
            );
            // TODO avoid testing protected property
            expect((chart as any).supportedPropertiesList).toEqual(
                LINE_CHART_SUPPORTED_PROPERTIES[AXIS.DUAL],
            );
        });
    });

    describe("handling date items", () => {
        describe("with multiple dates", () => {
            const inputs: [string, IReferencePoint, Partial<IExtendedReferencePoint>][] = [
                [
                    "from table to line chart: date in rows only",
                    referencePointMocks.dateAsFirstCategoryReferencePoint,
                    {
                        buckets: [
                            referencePointMocks.dateAsFirstCategoryReferencePoint.buckets[0],
                            {
                                localIdentifier: "trend",
                                items: referencePointMocks.dateAsFirstCategoryReferencePoint.buckets[1].items.slice(
                                    0,
                                    1,
                                ),
                            },
                            {
                                localIdentifier: "segment",
                                items: referencePointMocks.dateAsFirstCategoryReferencePoint.buckets[1].items.slice(
                                    1,
                                    2,
                                ),
                            },
                        ],
                    },
                ],
                [
                    "from table to line chart: two identical dates in rows",
                    referencePointMocks.twoIdenticalDatesInRowsWithSingleMeasure,
                    {
                        buckets: [
                            referencePointMocks.twoIdenticalDatesInRowsWithSingleMeasure.buckets[0],
                            {
                                localIdentifier: "trend",
                                items: referencePointMocks.twoIdenticalDatesInRowsWithSingleMeasure.buckets[1].items.slice(
                                    0,
                                    1,
                                ),
                            },
                            {
                                localIdentifier: "segment",
                                items: referencePointMocks.twoIdenticalDatesInRowsWithSingleMeasure.buckets[1].items.slice(
                                    1,
                                    2,
                                ),
                            },
                        ],
                    },
                ],
                [
                    "from table to line chart: multiple dates in rows but not first (date should get preference)",
                    referencePointMocks.multipleDatesNotAsFirstReferencePointWithSingleMeasure,
                    {
                        buckets: [
                            referencePointMocks.multipleDatesNotAsFirstReferencePointWithSingleMeasure
                                .buckets[0],
                            {
                                localIdentifier: "trend",
                                items: referencePointMocks.multipleDatesNotAsFirstReferencePointWithSingleMeasure.buckets[1].items.slice(
                                    1,
                                    2,
                                ),
                            },
                            {
                                localIdentifier: "segment",
                                items: referencePointMocks.multipleDatesNotAsFirstReferencePoint.buckets[1].items.slice(
                                    0,
                                    1,
                                ),
                            },
                        ],
                    },
                ],
                [
                    "from table to line chart: multiple dates in rows but not first, more measures",
                    referencePointMocks.multipleDatesNotAsFirstReferencePoint,
                    {
                        buckets: [
                            referencePointMocks.multipleDatesNotAsFirstReferencePoint.buckets[0],
                            {
                                localIdentifier: "trend",
                                items: referencePointMocks.multipleDatesNotAsFirstReferencePoint.buckets[1].items.slice(
                                    1,
                                    2,
                                ),
                            },
                            {
                                localIdentifier: "segment",
                                items: [],
                            },
                        ],
                    },
                ],
                [
                    "from column to line chart: two dates",
                    referencePointMocks.twoDatesInColumnChart,
                    {
                        buckets: [
                            referencePointMocks.twoDatesInColumnChart.buckets[0],
                            {
                                localIdentifier: "trend",
                                items: referencePointMocks.twoDatesInColumnChart.buckets[1].items.slice(0, 1),
                            },
                            {
                                localIdentifier: "segment",
                                items: referencePointMocks.twoDatesInColumnChart.buckets[2].items.slice(0, 1),
                            },
                        ],
                    },
                ],
                [
                    "from column to line chart: three dates",
                    referencePointMocks.threeDatesInColumnChart,
                    {
                        buckets: [
                            referencePointMocks.threeDatesInColumnChart.buckets[0],
                            {
                                localIdentifier: "trend",
                                items: referencePointMocks.threeDatesInColumnChart.buckets[1].items.slice(
                                    0,
                                    1,
                                ),
                            },
                            {
                                localIdentifier: "segment",
                                items: referencePointMocks.threeDatesInColumnChart.buckets[2].items.slice(
                                    0,
                                    1,
                                ),
                            },
                        ],
                    },
                ],
                [
                    "from column to line chart: first attribute is not date (date should get preference)",
                    referencePointMocks.multipleDatesNotAsFirstReferencePointWithSingleMeasureColumn,
                    {
                        buckets: [
                            referencePointMocks.multipleDatesNotAsFirstReferencePointWithSingleMeasureColumn
                                .buckets[0],
                            {
                                localIdentifier: "trend",
                                items: referencePointMocks.multipleDatesNotAsFirstReferencePointWithSingleMeasureColumn.buckets[1].items.slice(
                                    1,
                                    2,
                                ),
                            },
                            {
                                localIdentifier: "segment",
                                items: referencePointMocks.multipleDatesNotAsFirstReferencePointWithSingleMeasureColumn.buckets[2].items.slice(
                                    0,
                                    1,
                                ),
                            },
                        ],
                    },
                ],
                [
                    "from column to line chart: date should be moved to segment by (should not prioritize dates in stacks)",
                    referencePointMocks.twoAttributesInViewAndOneDateInColumnsReferencePoint,
                    {
                        buckets: [
                            referencePointMocks.twoAttributesInViewAndOneDateInColumnsReferencePoint
                                .buckets[0],
                            {
                                localIdentifier: "trend",
                                items: referencePointMocks.twoAttributesInViewAndOneDateInColumnsReferencePoint.buckets[1].items.slice(
                                    0,
                                    1,
                                ),
                            },
                            {
                                localIdentifier: "segment",
                                items: referencePointMocks.twoAttributesInViewAndOneDateInColumnsReferencePoint.buckets[2].items.slice(
                                    0,
                                    1,
                                ),
                            },
                        ],
                    },
                ],
                [
                    "from column to line chart: attribute should be moved to segment by",
                    referencePointMocks.datesInViewByAndAttributeInStackBy,
                    {
                        buckets: [
                            referencePointMocks.datesInViewByAndAttributeInStackBy.buckets[0],
                            {
                                localIdentifier: "trend",
                                items: referencePointMocks.datesInViewByAndAttributeInStackBy.buckets[1].items.slice(
                                    0,
                                    1,
                                ),
                            },
                            {
                                localIdentifier: "segment",
                                items: referencePointMocks.datesInViewByAndAttributeInStackBy.buckets[2].items.slice(
                                    0,
                                    1,
                                ),
                            },
                        ],
                    },
                ],
                [
                    "from column to line chart: date should not duplicate in view by",
                    referencePointMocks.onlyStackColumnChart,
                    {
                        buckets: [
                            referencePointMocks.onlyStackColumnChart.buckets[0],
                            {
                                localIdentifier: "trend",
                                items: [],
                            },
                            {
                                localIdentifier: "segment",
                                items: referencePointMocks.onlyStackColumnChart.buckets[2].items.slice(0, 1),
                            },
                        ],
                    },
                ],
            ];
            it.each(inputs)(
                "should return correct extended reference (%s)",
                async (
                    _description,
                    inputReferencePoint: IReferencePoint,
                    expectedReferencePoint: Partial<IExtendedReferencePoint>,
                ) => {
                    const lineChart = createComponent({
                        ...defaultProps,
                        featureFlags: {
                            enableMultipleDates: true,
                        },
                    });

                    const referencePoint = await lineChart.getExtendedReferencePoint(inputReferencePoint);
                    expect(referencePoint).toMatchObject(expectedReferencePoint);
                },
            );
        });
    });

    describe("Drill Down", () => {
        it.each([
            [
                "on segmentby attribute",
                sourceInsightDef,
                Region,
                targetUri,
                intersection,
                expectedInsightDefRegion,
            ],
            [
                "on viewby attribute",
                sourceInsightDef,
                Department,
                targetUri,
                intersection,
                expectedInsightDefDepartment,
            ],
        ])(
            "%s should replace the drill down attribute and add intersection filters",
            (
                _testName: string,
                sourceInsightDefinition: IInsightDefinition,
                drillSourceAttribute: IAttribute,
                drillTargetUri: string,
                drillIntersection: IDrillEventIntersectionElement[],
                expectedInsightDefinition: IInsightDefinition,
            ) => {
                const chart = createComponent();
                const drillDefinition = createDrillDefinition(drillSourceAttribute, drillTargetUri);
                const sourceInsight = insightDefinitionToInsight(sourceInsightDefinition, "first", "first");
                const expectedInsight = insightDefinitionToInsight(
                    expectedInsightDefinition,
                    "first",
                    "first",
                );

                const result: IInsight = chart.getInsightWithDrillDownApplied(sourceInsight, {
                    drillDefinition,
                    event: createDrillEvent("treemap", drillIntersection),
                });

                expect(result).toEqual(expectedInsight);
            },
        );
    });
});
