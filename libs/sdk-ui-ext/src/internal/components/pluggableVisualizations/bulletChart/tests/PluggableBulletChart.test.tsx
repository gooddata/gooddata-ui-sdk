// (C) 2020-2022 GoodData Corporation
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import { PluggableBulletChart } from "../PluggableBulletChart";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import {
    IBucketOfFun,
    IExtendedReferencePoint,
    IFilters,
    IReferencePoint,
    IVisConstruct,
} from "../../../../interfaces/Visualization";
import { DEFAULT_BULLET_CHART_CONFIG } from "../../../../constants/uiConfig";
import { OverTimeComparisonTypes, BucketNames, IDrillEventIntersectionElement } from "@gooddata/sdk-ui";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IInsight, IInsightDefinition, IAttribute } from "@gooddata/sdk-model";
import { Department, Region } from "@gooddata/reference-workspace/dist/md/full";
import { createDrillEvent, insightDefinitionToInsight, createDrillDefinition } from "../../tests/testHelpers";
import {
    sourceInsightDef,
    intersection,
    expectedInsightDefRegion,
    expectedInsightDefDepartment,
    targetUri,
} from "./getInsightWithDrillDownAppliedMock";
import { attributeItems, dateItem, masterMeasureItems } from "../../../../tests/mocks/referencePointMocks";

const defaultProps: IVisConstruct = {
    backend: dummyBackend(),
    projectId: "PROJECTID",
    element: "body",
    configPanelElement: null as string,
    callbacks: {
        afterRender: noop,
        pushData: noop,
    },
    renderFun: noop,
    visualizationProperties: {},
};

function createComponent(props: IVisConstruct = defaultProps) {
    return new PluggableBulletChart(props);
}

describe("PluggableBulletChart", () => {
    const bulletChart = createComponent();

    it("should create visualization", () => {
        expect(bulletChart).toBeTruthy();
    });

    it("should return reference point with three measures and one category and only valid filters", async () => {
        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "secondary_measures",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items.slice(
                    1,
                    2,
                ),
            },
            {
                localIdentifier: "tertiary_measures",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items.slice(
                    2,
                    3,
                ),
            },
            {
                localIdentifier: "view",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[1].items.slice(
                    0,
                    2,
                ),
            },
        ];

        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.filters.items.slice(0, 2),
        };

        const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
        );

        const expectedUiConfig = {
            ...DEFAULT_BULLET_CHART_CONFIG,
            buckets: {
                [BucketNames.MEASURES]: {
                    ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.MEASURES],
                    canAddItems: false,
                },
                [BucketNames.SECONDARY_MEASURES]: {
                    ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.MEASURES],
                    canAddItems: false,
                },
                [BucketNames.TERTIARY_MEASURES]: {
                    ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.MEASURES],
                    canAddItems: false,
                },
            },
        };

        expect(extendedReferencePoint).toMatchObject({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: expectedUiConfig,
            properties: {},
        });
    });

    it("should return reference point with three measures and no attribute", async () => {
        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "secondary_measures",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items.slice(
                    1,
                    2,
                ),
            },
            {
                localIdentifier: "tertiary_measures",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items.slice(
                    2,
                    3,
                ),
            },
            {
                localIdentifier: "view",
                items: [],
            },
        ];

        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };

        const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
        );

        const expectedUiConfig = {
            ...DEFAULT_BULLET_CHART_CONFIG,
            buckets: {
                [BucketNames.MEASURES]: {
                    ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.MEASURES],
                    canAddItems: false,
                },
                [BucketNames.SECONDARY_MEASURES]: {
                    ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.MEASURES],
                    canAddItems: false,
                },
                [BucketNames.TERTIARY_MEASURES]: {
                    ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.MEASURES],
                    canAddItems: false,
                },
            },
        };

        expect(extendedReferencePoint).toMatchObject({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: expectedUiConfig,
            properties: {},
        });
    });

    it("should return reference point with target and comparative measures and one category", async () => {
        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: [],
            },
            {
                localIdentifier: "secondary_measures",
                items: referencePointMocks.secondaryMeasuresAndAttributeReferencePoint.buckets[1].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "tertiary_measures",
                items: referencePointMocks.secondaryMeasuresAndAttributeReferencePoint.buckets[1].items.slice(
                    1,
                    2,
                ),
            },
            {
                localIdentifier: "view",
                items: referencePointMocks.secondaryMeasuresAndAttributeReferencePoint.buckets[2].items.slice(
                    0,
                    2,
                ),
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: referencePointMocks.secondaryMeasuresAndAttributeReferencePoint.filters.items.slice(0, 2),
        };

        const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
            referencePointMocks.secondaryAndTertiaryMeasuresWithTwoAttributesReferencePoint,
        );

        const expectedUiConfig = {
            ...DEFAULT_BULLET_CHART_CONFIG,
            buckets: {
                [BucketNames.SECONDARY_MEASURES]: {
                    ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.MEASURES],
                    canAddItems: false,
                },
                [BucketNames.TERTIARY_MEASURES]: {
                    ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.MEASURES],
                    canAddItems: false,
                },
            },
        };

        expect(extendedReferencePoint).toMatchObject({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: expectedUiConfig,
            properties: {},
        });
    });

    describe("handling date items", () => {
        describe("with multiple dates", () => {
            const inputs: [string, IReferencePoint, Partial<IExtendedReferencePoint>][] = [
                [
                    "from table to bullet chart: two same dates in view by (should ignore date with different date dimension)",
                    referencePointMocks.twoIdenticalDatesInRowsAndColumns,
                    {
                        buckets: [
                            {
                                localIdentifier: "measures",
                                items: masterMeasureItems.slice(0, 1),
                            },
                            {
                                localIdentifier: "secondary_measures",
                                items: [],
                            },
                            {
                                localIdentifier: "tertiary_measures",
                                items: [],
                            },
                            {
                                localIdentifier: "view",
                                items: [dateItem, dateItem],
                            },
                        ],
                        filters: {
                            localIdentifier: "filters",
                            items: [],
                        },
                    },
                ],
                [
                    "from table to bullet chart: one date in view by (view by should not contain dates with different date dimensions)",
                    referencePointMocks.threeDifferentDatesReferencePoint,
                    {
                        buckets: [
                            {
                                localIdentifier: "measures",
                                items: masterMeasureItems.slice(0, 1),
                            },
                            {
                                localIdentifier: "secondary_measures",
                                items: [],
                            },
                            {
                                localIdentifier: "tertiary_measures",
                                items: [],
                            },
                            {
                                localIdentifier: "view",
                                items: [dateItem],
                            },
                        ],
                        filters: {
                            localIdentifier: "filters",
                            items: [],
                        },
                    },
                ],
                [
                    "from table to bullet chart: max two dates in view by",
                    referencePointMocks.threeIdenticalDatesInRowsAndColumns,
                    {
                        buckets: [
                            {
                                localIdentifier: "measures",
                                items: masterMeasureItems.slice(0, 1),
                            },
                            {
                                localIdentifier: "secondary_measures",
                                items: [],
                            },
                            {
                                localIdentifier: "tertiary_measures",
                                items: [],
                            },
                            {
                                localIdentifier: "view",
                                items: [dateItem, dateItem],
                            },
                        ],
                        filters: {
                            localIdentifier: "filters",
                            items: [],
                        },
                    },
                ],
                [
                    "from table to bullet chart: attribute and date in view by",
                    referencePointMocks.multipleDatesNotAsFirstReferencePointWithSingleMeasureColumn,
                    {
                        buckets: [
                            {
                                localIdentifier: "measures",
                                items: masterMeasureItems.slice(0, 1),
                            },
                            {
                                localIdentifier: "secondary_measures",
                                items: [],
                            },
                            {
                                localIdentifier: "tertiary_measures",
                                items: [],
                            },
                            {
                                localIdentifier: "view",
                                items: [attributeItems[0], dateItem],
                            },
                        ],
                        filters: {
                            localIdentifier: "filters",
                            items: [],
                        },
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
                    const chart = createComponent({
                        ...defaultProps,
                        featureFlags: {
                            enableMultipleDates: true,
                        },
                    });

                    const referencePoint = await chart.getExtendedReferencePoint(inputReferencePoint);
                    expect(referencePoint).toMatchObject(expectedReferencePoint);
                },
            );
        });

        it("should keep Date items with the same dimension", async () => {
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [
                        ...referencePointMocks.dateAttributeOnRowsAndColumnsReferencePoint.buckets[0].items,
                    ],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [],
                },
                {
                    localIdentifier: "tertiary_measures",
                    items: [],
                },
                {
                    localIdentifier: "view",
                    items: [
                        ...referencePointMocks.dateAttributeOnRowsAndColumnsReferencePoint.buckets[1].items,
                        ...referencePointMocks.dateAttributeOnRowsAndColumnsReferencePoint.buckets[2].items,
                    ],
                },
            ];

            const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
                referencePointMocks.dateAttributeOnRowsAndColumnsReferencePoint,
            );

            expect(extendedReferencePoint).toMatchObject({
                buckets: expectedBuckets,
            });
        });

        it("should keep first Date item when items have different dimensions", async () => {
            const mockRefPoint = cloneDeep(referencePointMocks.dateAttributeOnRowsAndColumnsReferencePoint);
            mockRefPoint.buckets[2].items[0].dateDatasetRef = {
                uri: "closed",
            };

            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [...mockRefPoint.buckets[0].items],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [],
                },
                {
                    localIdentifier: "tertiary_measures",
                    items: [],
                },
                {
                    localIdentifier: "view",
                    items: [...mockRefPoint.buckets[1].items],
                },
            ];

            const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toMatchObject({
                buckets: expectedBuckets,
            });
        });
    });

    describe("Arithmetic measures", () => {
        it("should add AM that does fit", async () => {
            const extendedReferencePoint = await bulletChart.getExtendedReferencePoint({
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            referencePointMocks.arithmeticMeasureItems[3],
                            referencePointMocks.derivedMeasureItems[0],
                            referencePointMocks.masterMeasureItems[1],
                            referencePointMocks.masterMeasureItems[0],
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
                    items: [referencePointMocks.arithmeticMeasureItems[3]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [referencePointMocks.derivedMeasureItems[0]],
                },
                {
                    localIdentifier: "tertiary_measures",
                    items: [referencePointMocks.masterMeasureItems[0]],
                },
                {
                    localIdentifier: "view",
                    items: [],
                },
            ]);
        });

        it("should skip AM that does not fit and place derived together with master", async () => {
            const extendedReferencePoint = await bulletChart.getExtendedReferencePoint({
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            referencePointMocks.masterMeasureItems[0],
                            referencePointMocks.arithmeticMeasureItems[6],
                            referencePointMocks.masterMeasureItems[1],
                            referencePointMocks.derivedMeasureItems[0],
                            referencePointMocks.masterMeasureItems[2],
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
                    localIdentifier: "tertiary_measures",
                    items: [referencePointMocks.derivedMeasureItems[0]],
                },
                {
                    localIdentifier: "view",
                    items: [],
                },
            ]);
        });

        it("should accept arithmetic measure when it has the same measure in both operands", async () => {
            const extendedReferencePoint = await bulletChart.getExtendedReferencePoint({
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
                    localIdentifier: "tertiary_measures",
                    items: [referencePointMocks.masterMeasureItems[1]],
                },
                {
                    localIdentifier: "view",
                    items: [],
                },
            ]);
        });
    });

    describe("Over Time Comparison", () => {
        it("should return reference point containing uiConfig with PP, SP supported comparison types", async () => {
            const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
                referencePointMocks.emptyReferencePoint,
            );

            expect(extendedReferencePoint.uiConfig.supportedOverTimeComparisonTypes).toEqual([
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            ]);
        });

        describe("placing new derived items", () => {
            it("should place new derived bucket item to tertiary measures bucket", async () => {
                const referencePoint: IReferencePoint = {
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [referencePointMocks.masterMeasureItems[0]],
                        },
                        {
                            localIdentifier: "secondary_measures",
                            items: [referencePointMocks.masterMeasureItems[1]],
                        },
                        {
                            localIdentifier: "tertiary_measures",
                            items: [],
                        },
                        {
                            localIdentifier: "view",
                            items: [],
                        },
                    ],
                    filters: {
                        localIdentifier: "filters",
                        items: [referencePointMocks.overTimeComparisonDateItem],
                    },
                };

                const referencePointWithDerivedItems = await bulletChart.addNewDerivedBucketItems(
                    referencePoint,
                    [referencePointMocks.derivedMeasureItems[0]],
                );

                const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
                    referencePointWithDerivedItems,
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
                        localIdentifier: "tertiary_measures",
                        items: [referencePointMocks.derivedMeasureItems[0]],
                    },
                    {
                        localIdentifier: "view",
                        items: [],
                    },
                ]);
            });

            it("should place new derived bucket item to secondary measures bucket", async () => {
                const referencePoint: IReferencePoint = {
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [referencePointMocks.masterMeasureItems[0]],
                        },
                        {
                            localIdentifier: "secondary_measures",
                            items: [],
                        },
                        {
                            localIdentifier: "tertiary_measures",
                            items: [],
                        },
                        {
                            localIdentifier: "view",
                            items: [],
                        },
                    ],
                    filters: {
                        localIdentifier: "filters",
                        items: [referencePointMocks.overTimeComparisonDateItem],
                    },
                };

                const referencePointWithDerivedItems = await bulletChart.addNewDerivedBucketItems(
                    referencePoint,
                    [referencePointMocks.derivedMeasureItems[0]],
                );

                const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
                    referencePointWithDerivedItems,
                );

                expect(extendedReferencePoint.buckets).toEqual([
                    {
                        localIdentifier: "measures",
                        items: [referencePointMocks.masterMeasureItems[0]],
                    },
                    {
                        localIdentifier: "secondary_measures",
                        items: [referencePointMocks.derivedMeasureItems[0]],
                    },
                    {
                        localIdentifier: "tertiary_measures",
                        items: [],
                    },
                    {
                        localIdentifier: "view",
                        items: [],
                    },
                ]);
            });

            it("should remove first derived measure when filter is not related", async () => {
                const referencePoint: IReferencePoint = {
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [
                                referencePointMocks.derivedMeasureItems[0],
                                referencePointMocks.masterMeasureItems[0],
                            ],
                        },
                        {
                            localIdentifier: "attribute",
                            items: [
                                {
                                    ...referencePointMocks.dateItem,
                                    dateDatasetRef: {
                                        uri: "/gdc/md/a1",
                                    },
                                },
                            ],
                        },
                        {
                            localIdentifier: "columns",
                            items: [
                                {
                                    ...referencePointMocks.dateItem,
                                    localIdentifier: "a2",
                                    dateDatasetRef: {
                                        uri: "/gdc/md/a2",
                                    },
                                },
                            ],
                        },
                    ],
                    filters: referencePointMocks.attributeFilterBucketItem,
                };

                const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(referencePoint);

                expect(extendedReferencePoint.buckets).toEqual([
                    {
                        localIdentifier: "measures",
                        items: [referencePointMocks.masterMeasureItems[0]],
                    },
                    {
                        localIdentifier: "secondary_measures",
                        items: [],
                    },
                    {
                        localIdentifier: "tertiary_measures",
                        items: [],
                    },
                    {
                        localIdentifier: "view",
                        items: [
                            {
                                ...referencePointMocks.dateItem,
                                localIdentifier: "a1",
                                dateDatasetRef: {
                                    uri: "/gdc/md/a1",
                                },
                            },
                        ],
                    },
                ]);
            });
        });
    });

    describe("Drill Down", () => {
        it.each([
            [
                "on outer viewby attribute",
                sourceInsightDef,
                Region,
                targetUri,
                intersection,
                expectedInsightDefRegion,
            ],
            [
                "on inner viewby attribute",
                sourceInsightDef,
                Department,
                targetUri,
                intersection,
                expectedInsightDefDepartment,
            ],
        ])(
            "%s should replace the drill down attribute and add correct intersection filters",
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
                    event: createDrillEvent("bullet", drillIntersection),
                });

                expect(result).toEqual(expectedInsight);
            },
        );
    });

    describe("Sort config", () => {
        const scenarios: Array<[string, IReferencePoint]> = [
            ["0 M + 0 VB", referencePointMocks.emptyReferencePoint],
            ["1 M + 0 VB", referencePointMocks.oneMetricNoCategoriesReferencePoint],
            ["0 M + 1 VB", referencePointMocks.justViewByReferencePoint],
            ["1 M + 1 VB", referencePointMocks.onePrimaryMetricAndOneViewByRefPoint],
            ["1 M + 2 VB", referencePointMocks.oneMetricAndTwoCategoriesReferencePoint],
            ["2 M + 1 VB", referencePointMocks.twoMetricsAndOneViewByRefPoint],
            ["2 M + 2 VB", referencePointMocks.twoMeasuresBucketsTwoViewByReferencePoint],
            ["3 M + 1 VB", referencePointMocks.threeMeasuresBucketsReferencePoint],
            ["3 M + 2 VB", referencePointMocks.threeMeasuresTwoViewByReferencePoint],
        ];

        it.each(scenarios)("should return expected sort config for %s", async (_name, referencePointMock) => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(referencePointMock);

            expect(sortConfig).toMatchSnapshot();
        });
    });
});
