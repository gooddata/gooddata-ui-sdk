// (C) 2020-2026 GoodData Corporation

import { cloneDeep } from "lodash-es";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IAttribute, type IInsight, type IInsightDefinition } from "@gooddata/sdk-model";
import { type IDrillEventIntersectionElement, OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import {
    expectedInsightDefDepartment,
    expectedInsightDefRegion,
    intersection,
    sourceInsightDef,
    targetUri,
} from "./getInsightWithDrillDownAppliedMock.js";
import {
    type IBucketOfFun,
    type IExtendedReferencePoint,
    type IReferencePoint,
    type IVisConstruct,
} from "../../../../interfaces/Visualization.js";
import {
    arithmeticMeasureItems,
    attributeFilterBucketItem,
    attributeItems,
    dateAttributeOnRowsAndColumnsReferencePoint,
    dateItem,
    derivedMeasureItems,
    emptyReferencePoint,
    justViewByReferencePoint,
    masterMeasureItems,
    multipleDatesNotAsFirstReferencePointWithSingleMeasureColumn,
    multipleMetricsAndCategoriesReferencePoint,
    multipleMetricsNoCategoriesReferencePoint,
    oneMetricAndTwoCategoriesReferencePoint,
    oneMetricNoCategoriesReferencePoint,
    onePrimaryMetricAndOneViewByRefPoint,
    overTimeComparisonDateItem,
    secondaryAndTertiaryMeasuresWithTwoAttributesReferencePoint,
    threeDifferentDatesReferencePoint,
    threeIdenticalDatesInRowsAndColumns,
    threeMeasuresBucketsReferencePoint,
    threeMeasuresTwoViewByReferencePoint,
    twoIdenticalDatesInRowsAndColumns,
    twoMeasuresBucketsTwoViewByReferencePoint,
    twoMetricsAndOneViewByRefPoint,
} from "../../../../tests/mocks/referencePointMocks.js";
import { insightWithSingleMeasure } from "../../../../tests/mocks/testMocks.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../../utils/translations.js";
import {
    createDrillDefinition,
    createDrillEvent,
    getLastRenderEl,
    insightDefinitionToInsight,
} from "../../tests/pluggableVisualizations.test.helpers.js";
import { PluggableBulletChart } from "../PluggableBulletChart.js";

const { Department, Region } = ReferenceMd;

describe("PluggableBulletChart", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();
    const executionFactory = dummyBackend().workspace("PROJECTID").execution();
    const defaultProps: IVisConstruct = {
        backend: dummyBackend(),
        projectId: "PROJECTID",
        element: () => mockElement,
        configPanelElement: () => mockConfigElement,
        callbacks: {
            afterRender: () => {},
            pushData: () => {},
        },
        renderFun: mockRenderFun,
        messages,
        visualizationProperties: {},
    } as unknown as IVisConstruct;

    const bulletChart = createComponent();

    function createComponent(props: IVisConstruct = defaultProps) {
        return new PluggableBulletChart(props);
    }

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    it("should create visualization", () => {
        expect(bulletChart).toBeTruthy();
    });

    it("should return reference point with three measures and one category and only valid filters", async () => {
        const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
            multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with three measures and no attribute", async () => {
        const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
            multipleMetricsNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with target and comparative measures and one category", async () => {
        const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
            secondaryAndTertiaryMeasuresWithTwoAttributesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    describe("handling date items", () => {
        describe("with multiple dates", () => {
            const inputs: [string, IReferencePoint, Partial<IExtendedReferencePoint>][] = [
                [
                    "from table to bullet chart: two same dates in view by (should ignore date with different date dimension)",
                    twoIdenticalDatesInRowsAndColumns,
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
                    threeDifferentDatesReferencePoint,
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
                    threeIdenticalDatesInRowsAndColumns,
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
                    multipleDatesNotAsFirstReferencePointWithSingleMeasureColumn,
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
                    const chart = createComponent();

                    const referencePoint = await chart.getExtendedReferencePoint(inputReferencePoint);
                    expect(referencePoint).toMatchObject(expectedReferencePoint);
                },
            );
        });

        it("should keep Date items with the same dimension", async () => {
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [...dateAttributeOnRowsAndColumnsReferencePoint.buckets[0].items],
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
                        ...dateAttributeOnRowsAndColumnsReferencePoint.buckets[1].items,
                        ...dateAttributeOnRowsAndColumnsReferencePoint.buckets[2].items,
                    ],
                },
            ];

            const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
                dateAttributeOnRowsAndColumnsReferencePoint,
            );

            expect(extendedReferencePoint).toMatchObject({
                buckets: expectedBuckets,
            });
        });

        it("should keep first Date item when items have different dimensions", async () => {
            const mockRefPoint = cloneDeep(dateAttributeOnRowsAndColumnsReferencePoint);
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
                            arithmeticMeasureItems[3],
                            derivedMeasureItems[0],
                            masterMeasureItems[1],
                            masterMeasureItems[0],
                        ],
                    },
                ],
                filters: {
                    localIdentifier: "filters",
                    items: [overTimeComparisonDateItem],
                },
            });

            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [arithmeticMeasureItems[3]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [derivedMeasureItems[0]],
                },
                {
                    localIdentifier: "tertiary_measures",
                    items: [masterMeasureItems[0]],
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
                            masterMeasureItems[0],
                            arithmeticMeasureItems[6],
                            masterMeasureItems[1],
                            derivedMeasureItems[0],
                            masterMeasureItems[2],
                        ],
                    },
                ],
                filters: {
                    localIdentifier: "filters",
                    items: [overTimeComparisonDateItem],
                },
            });

            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[0]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [masterMeasureItems[1]],
                },
                {
                    localIdentifier: "tertiary_measures",
                    items: [derivedMeasureItems[0]],
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
                        items: [arithmeticMeasureItems[2], masterMeasureItems[0], masterMeasureItems[1]],
                    },
                ],
                filters: {
                    localIdentifier: "filters",
                    items: [overTimeComparisonDateItem],
                },
            });

            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [arithmeticMeasureItems[2]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [masterMeasureItems[0]],
                },
                {
                    localIdentifier: "tertiary_measures",
                    items: [masterMeasureItems[1]],
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
            const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(emptyReferencePoint);

            expect(extendedReferencePoint.uiConfig!.supportedOverTimeComparisonTypes).toEqual([
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
                            items: [masterMeasureItems[0]],
                        },
                        {
                            localIdentifier: "secondary_measures",
                            items: [masterMeasureItems[1]],
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
                        items: [overTimeComparisonDateItem],
                    },
                };

                const referencePointWithDerivedItems = await bulletChart.addNewDerivedBucketItems(
                    referencePoint,
                    [derivedMeasureItems[0]],
                );

                const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
                    referencePointWithDerivedItems,
                );

                expect(extendedReferencePoint.buckets).toEqual([
                    {
                        localIdentifier: "measures",
                        items: [masterMeasureItems[0]],
                    },
                    {
                        localIdentifier: "secondary_measures",
                        items: [masterMeasureItems[1]],
                    },
                    {
                        localIdentifier: "tertiary_measures",
                        items: [derivedMeasureItems[0]],
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
                            items: [masterMeasureItems[0]],
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
                        items: [overTimeComparisonDateItem],
                    },
                };

                const referencePointWithDerivedItems = await bulletChart.addNewDerivedBucketItems(
                    referencePoint,
                    [derivedMeasureItems[0]],
                );

                const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
                    referencePointWithDerivedItems,
                );

                expect(extendedReferencePoint.buckets).toEqual([
                    {
                        localIdentifier: "measures",
                        items: [masterMeasureItems[0]],
                    },
                    {
                        localIdentifier: "secondary_measures",
                        items: [derivedMeasureItems[0]],
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
                            items: [derivedMeasureItems[0], masterMeasureItems[0]],
                        },
                        {
                            localIdentifier: "attribute",
                            items: [
                                {
                                    ...dateItem,
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
                                    ...dateItem,
                                    localIdentifier: "a2",
                                    dateDatasetRef: {
                                        uri: "/gdc/md/a2",
                                    },
                                },
                            ],
                        },
                    ],
                    filters: attributeFilterBucketItem,
                };

                const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(referencePoint);

                expect(extendedReferencePoint.buckets).toEqual([
                    {
                        localIdentifier: "measures",
                        items: [masterMeasureItems[0]],
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
                                ...dateItem,
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
                Region.Default,
                targetUri,
                intersection,
                expectedInsightDefRegion,
            ],
            [
                "on inner viewby attribute",
                sourceInsightDef,
                Department.Default,
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

                const result: IInsight = chart.getInsightWithDrillDownApplied(
                    sourceInsight,
                    {
                        drillDefinition,
                        event: createDrillEvent("bullet", drillIntersection),
                    },
                    true,
                );

                expect(result).toEqual(expectedInsight);
            },
        );
    });

    describe("Sort config", () => {
        const scenarios: Array<[string, IReferencePoint]> = [
            ["0 M + 0 VB", emptyReferencePoint],
            ["1 M + 0 VB", oneMetricNoCategoriesReferencePoint],
            ["0 M + 1 VB", justViewByReferencePoint],
            ["1 M + 1 VB", onePrimaryMetricAndOneViewByRefPoint],
            ["1 M + 2 VB", oneMetricAndTwoCategoriesReferencePoint],
            ["2 M + 1 VB", twoMetricsAndOneViewByRefPoint],
            ["2 M + 2 VB", twoMeasuresBucketsTwoViewByReferencePoint],
            ["3 M + 1 VB", threeMeasuresBucketsReferencePoint],
            ["3 M + 2 VB", threeMeasuresTwoViewByReferencePoint],
        ];

        it.each(scenarios)("should return expected sort config for %s", async (_name, referencePointMock) => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(referencePointMock);

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
