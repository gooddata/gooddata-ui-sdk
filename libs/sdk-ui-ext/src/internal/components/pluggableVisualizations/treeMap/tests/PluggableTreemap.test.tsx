// (C) 2019-2021 GoodData Corporation
import noop from "lodash/noop";
import { PluggableTreemap } from "../PluggableTreemap";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import * as uiConfigMocks from "../../../../tests/mocks/uiConfigMocks";

import {
    IBucketOfFun,
    IFilters,
    IVisConstruct,
    IReferencePoint,
    IExtendedReferencePoint,
} from "../../../../interfaces/Visualization";
import { IDrillEventIntersectionElement } from "@gooddata/sdk-ui";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { Department, Region } from "@gooddata/reference-workspace/dist/md/full";
import { IInsight, IInsightDefinition, IAttribute } from "@gooddata/sdk-model";
import { createDrillEvent, insightDefinitionToInsight, createDrillDefinition } from "../../tests/testHelpers";
import {
    sourceInsightDef,
    intersection,
    expectedInsightDefRegion,
    expectedInsightDefDepartment,
    targetUri,
} from "./getInsightWithDrillDownAppliedMock";

describe("PluggableTreemap", () => {
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

    function createComponent(props: IVisConstruct = defaultProps) {
        return new PluggableTreemap(props);
    }

    it("should create visualization", () => {
        const visualization = createComponent();

        expect(visualization).toBeTruthy();
    });

    it("should return ref. point with 1 M, 1 Vb, 1 Sb and only valid filters for 1 M, 1 Vb, 1 Sb", async () => {
        const treemap = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.simpleStackedReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "view",
                items: referencePointMocks.simpleStackedReferencePoint.buckets[1].items,
            },
            {
                localIdentifier: "segment",
                items: referencePointMocks.simpleStackedReferencePoint.buckets[2].items,
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: referencePointMocks.simpleStackedReferencePoint.filters.items,
        };

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(
            referencePointMocks.simpleStackedReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: uiConfigMocks.multipleMeasuresAndCategoriesTreemapUiConfig,
            properties: {},
        });
    });

    it("should return ref. point with 1 M, 1 Vb, 1 Sb and only valid filters for n M, n Vb, 0 Sb", async () => {
        const treemap = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "view",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[1].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "segment",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[1].items.slice(
                    1,
                    2,
                ),
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.filters.items.slice(0, 2),
        };

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: uiConfigMocks.multipleMeasuresAndCategoriesTreemapUiConfig,
            properties: {},
        });
    });

    it("should return ref. point with 1 M, 1 Vb, 1 Sb and only valid filters for n M, n Attrs", async () => {
        const treemap = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.samePeriodPreviousYearAndAttributesRefPoint.buckets[0].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "view",
                items: referencePointMocks.samePeriodPreviousYearAndAttributesRefPoint.buckets[1].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "segment",
                items: referencePointMocks.samePeriodPreviousYearAndAttributesRefPoint.buckets[1].items.slice(
                    1,
                    2,
                ),
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: referencePointMocks.samePeriodPreviousYearAndAttributesRefPoint.filters.items.slice(0, 2),
        };

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(
            referencePointMocks.samePeriodPreviousYearAndAttributesRefPoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: uiConfigMocks.multipleMeasuresAndCategoriesTreemapUiConfigWithDate,
            properties: {},
        });
    });

    it("should return ref. point with n M, 0 Vb, 0 Sb for n M, 0 Attr", async () => {
        const treemap = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.multipleMetricsNoCategoriesReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "view",
                items: [],
            },
            {
                localIdentifier: "segment",
                items: [],
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: uiConfigMocks.multipleMeasuresNoCategoriesTreemapUiConfig,
            properties: {},
        });
    });

    it("should return reference point with 1 M, 0 Vb, 0 Sb for 1 M, 0 Vb, 0 Sb", async () => {
        const treemap = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.oneMetricNoCategoriesReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "view",
                items: [],
            },
            {
                localIdentifier: "segment",
                items: [],
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: referencePointMocks.oneMetricNoCategoriesReferencePoint.filters.items,
        };

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(
            referencePointMocks.oneMetricNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            properties: {},
            uiConfig: uiConfigMocks.oneMeasureNoCategoriesTreemapUiConfig,
        });
    });

    it("should return ref. point with n M, 0 Vb, 1 Sb for n M, 0 Vb, 1 Sb", async () => {
        const treemap = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.multipleMetricsOneStackByReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "view",
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

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsOneStackByReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: uiConfigMocks.multipleMetricsOneStackByUiConfig,
            properties: {},
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
                referencePointMocks.mixOfMeasuresWithDerivedAndArithmeticFromDerivedTreeMapReferencePoint,
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
                {
                    localIdentifier: "segment",
                    items: [],
                },
            ]);
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

    describe("handling date items", () => {
        describe("with multiple dates", () => {
            const inputs: [string, IReferencePoint, Partial<IExtendedReferencePoint>][] = [
                [
                    "from table to treemap chart: date in rows only",
                    referencePointMocks.dateAsFirstCategoryReferencePoint,
                    {
                        buckets: [
                            referencePointMocks.dateAsFirstCategoryReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
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
                    "from table to treemap chart: two identical dates in rows",
                    referencePointMocks.twoIdenticalDatesInRowsWithSingleMeasure,
                    {
                        buckets: [
                            referencePointMocks.twoIdenticalDatesInRowsWithSingleMeasure.buckets[0],
                            {
                                localIdentifier: "view",
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
                    "from table to treemap chart: multiple dates in rows but not first (date does not have preference)",
                    referencePointMocks.multipleDatesNotAsFirstReferencePointWithSingleMeasure,
                    {
                        buckets: [
                            referencePointMocks.multipleDatesNotAsFirstReferencePointWithSingleMeasure
                                .buckets[0],
                            {
                                localIdentifier: "view",
                                items: referencePointMocks.multipleDatesNotAsFirstReferencePointWithSingleMeasure.buckets[1].items.slice(
                                    0,
                                    1,
                                ),
                            },
                            {
                                localIdentifier: "segment",
                                items: referencePointMocks.multipleDatesNotAsFirstReferencePointWithSingleMeasure.buckets[1].items.slice(
                                    1,
                                    2,
                                ),
                            },
                        ],
                    },
                ],
                [
                    "from table to treemap chart: multiple dates in rows but not first, more measures",
                    referencePointMocks.multipleDatesNotAsFirstReferencePoint,
                    {
                        buckets: [
                            {
                                localIdentifier: "measures",
                                items: referencePointMocks.multipleDatesNotAsFirstReferencePoint.buckets[0].items.slice(
                                    0,
                                    1,
                                ),
                            },
                            {
                                localIdentifier: "view",
                                items: referencePointMocks.multipleDatesNotAsFirstReferencePoint.buckets[1].items.slice(
                                    0,
                                    1,
                                ),
                            },
                            {
                                localIdentifier: "segment",
                                items: referencePointMocks.multipleDatesNotAsFirstReferencePoint.buckets[1].items.slice(
                                    1,
                                    2,
                                ),
                            },
                        ],
                    },
                ],
                [
                    "from column to treemap chart: two dates",
                    referencePointMocks.twoDatesInColumnChart,
                    {
                        buckets: [
                            referencePointMocks.twoDatesInColumnChart.buckets[0],
                            {
                                localIdentifier: "view",
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
                    "from column to treemap chart: three dates",
                    referencePointMocks.threeDatesInColumnChart,
                    {
                        buckets: [
                            referencePointMocks.threeDatesInColumnChart.buckets[0],
                            {
                                localIdentifier: "view",
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
                    "from column to treemap chart: only stacks",
                    referencePointMocks.onlyStackColumnChart,
                    {
                        buckets: [
                            referencePointMocks.onlyStackColumnChart.buckets[0],
                            {
                                localIdentifier: "view",
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
    });
});
