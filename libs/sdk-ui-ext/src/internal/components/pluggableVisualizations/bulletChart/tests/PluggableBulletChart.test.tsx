// (C) 2020-2024 GoodData Corporation
import noop from "lodash/noop.js";
import cloneDeep from "lodash/cloneDeep.js";
import { PluggableBulletChart } from "../PluggableBulletChart.js";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks.js";
import {
    IBucketOfFun,
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
} from "../../../../interfaces/Visualization.js";
import { OverTimeComparisonTypes, IDrillEventIntersectionElement } from "@gooddata/sdk-ui";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IInsight, IInsightDefinition, IAttribute } from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    createDrillEvent,
    insightDefinitionToInsight,
    createDrillDefinition,
    getLastRenderEl,
} from "../../tests/testHelpers.js";
import {
    sourceInsightDef,
    intersection,
    expectedInsightDefRegion,
    expectedInsightDefDepartment,
    targetUri,
} from "./getInsightWithDrillDownAppliedMock.js";
import * as testMocks from "../../../../tests/mocks/testMocks.js";
import { describe, it, expect, vi, afterEach } from "vitest";

const { Department, Region } = ReferenceMd;

describe("PluggableBulletChart", () => {
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
            afterRender: noop,
            pushData: noop,
        },
        renderFun: mockRenderFun,
        visualizationProperties: {},
    };

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
            referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with three measures and no attribute", async () => {
        const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with target and comparative measures and one category", async () => {
        const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
            referencePointMocks.secondaryAndTertiaryMeasuresWithTwoAttributesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
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
                                items: referencePointMocks.masterMeasureItems.slice(0, 1),
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
                                items: [referencePointMocks.dateItem, referencePointMocks.dateItem],
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
                                items: referencePointMocks.masterMeasureItems.slice(0, 1),
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
                                items: [referencePointMocks.dateItem],
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
                                items: referencePointMocks.masterMeasureItems.slice(0, 1),
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
                                items: [referencePointMocks.dateItem, referencePointMocks.dateItem],
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
                                items: referencePointMocks.masterMeasureItems.slice(0, 1),
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
                                items: [referencePointMocks.attributeItems[0], referencePointMocks.dateItem],
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
