// (C) 2019-2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IAttribute, type IInsight, type IInsightDefinition } from "@gooddata/sdk-model";
import { type IDrillEventIntersectionElement, OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { AXIS } from "../../../../constants/axis.js";
import { LINE_CHART_SUPPORTED_PROPERTIES } from "../../../../constants/supportedProperties.js";
import {
    type IBucketOfFun,
    type IExtendedReferencePoint,
    type IReferencePoint,
    type IVisConstruct,
} from "../../../../interfaces/Visualization.js";
import {
    attributeInStackReferencePoint,
    dateAsFirstCategoryReferencePoint,
    dateAsSecondCategoryReferencePoint,
    datesInViewByAndAttributeInStackBy,
    emptyReferencePoint,
    justTrendByRefPoint,
    measureWithDateAfterOtherAttributes,
    measuresOnSecondaryAxisAndAttributeReferencePoint,
    multipleDatesNotAsFirstReferencePoint,
    multipleDatesNotAsFirstReferencePointWithSingleMeasure,
    multipleDatesNotAsFirstReferencePointWithSingleMeasureColumn,
    multipleMetricsAndCategoriesReferencePoint,
    multipleMetricsOneStackByReferencePoint,
    oneMetricAndCategoryAndStackReferencePoint,
    oneMetricAndManyCategoriesReferencePoint,
    oneMetricAndOneTrendAndOneSegmentByRefPoint,
    oneMetricAndTwoTrendByRefPoint,
    oneMetricNoTrendByRefPoint,
    oneMetricOneTrendBy,
    oneStackAndNoCategoriesReferencePoint,
    onlyStackColumnChart,
    samePeriodPreviousYearAndAttributesRefPoint,
    threeDatesInColumnChart,
    twoAttributesInViewAndOneDateInColumnsReferencePoint,
    twoDatesInColumnChart,
    twoIdenticalDatesInRowsWithSingleMeasure,
    twoMeasureBucketsReferencePoint,
    twoMetricAndOneTrendAndOneSegmentByRefPoint,
    twoMetricAndOneTrendByRefPoint,
    twoMetricAndTwoTrendByRefPoint,
    twoSegmentedMetricAndOneTrendByRefPoint,
    twoSegmentedMetricAndTwoTrendByRefPoint,
    wrongBucketsOrderInLineReferencePoint,
} from "../../../../tests/mocks/referencePointMocks.js";
import { insightWithSingleMeasure } from "../../../../tests/mocks/testMocks.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../../utils/translations.js";
import {
    createDrillDefinition,
    createDrillEvent,
    getLastRenderEl,
    insightDefinitionToInsight,
} from "../../tests/pluggableVisualizations.test.helpers.js";
import {
    expectedInsightDefDepartment,
    expectedInsightDefRegion,
    intersection,
    sourceInsightDef,
    targetUri,
} from "../../treeMap/tests/getInsightWithDrillDownAppliedMock.js";
import { PluggableLineChart } from "../PluggableLineChart.js";

const { Department, Region } = ReferenceMd;

describe("PluggableLineChart", () => {
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
            onError: () => {},
            onLoadingChanged: () => {},
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: mockRenderFun,
        messages,
    } as unknown as IVisConstruct;

    function createComponent(props = defaultProps) {
        return new PluggableLineChart(props);
    }

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    it("should reuse all measures, only one category and no stacks", async () => {
        const lineChart = createComponent();

        const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
            multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should reuse one measure, only one category and one category as stack", async () => {
        const lineChart = createComponent();

        const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
            oneMetricAndManyCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with Date in categories even it was as second item", async () => {
        const lineChart = createComponent();

        const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
            dateAsSecondCategoryReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with one category and one stack", async () => {
        const lineChart = createComponent();

        const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
            oneMetricAndCategoryAndStackReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point when no categories and only stacks", async () => {
        const lineChart = createComponent();

        const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
            oneStackAndNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should cut out measures tail when getting nM 0Vb 1Sb", async () => {
        const lineChart = createComponent();

        const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
            multipleMetricsOneStackByReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should handle wrong order of buckets in reference point", async () => {
        const lineChart = createComponent();

        const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
            wrongBucketsOrderInLineReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it(
        'should remove derived measure and place date to "trend" and first of other attributes to "segment" ' +
            "when single measure with comparison is applied and date is first attribute",
        async () => {
            const lineChart = createComponent();

            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [samePeriodPreviousYearAndAttributesRefPoint.buckets[0].items[0]],
                },
                {
                    localIdentifier: "trend",
                    items: [samePeriodPreviousYearAndAttributesRefPoint.buckets[1].items[0]],
                },
                {
                    localIdentifier: "segment",
                    items: [samePeriodPreviousYearAndAttributesRefPoint.buckets[1].items[1]],
                },
            ];

            const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
                samePeriodPreviousYearAndAttributesRefPoint,
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
                    items: [measureWithDateAfterOtherAttributes.buckets[0].items[0]],
                },
                {
                    localIdentifier: "trend",
                    items: [measureWithDateAfterOtherAttributes.buckets[1].items[2]],
                },
                {
                    localIdentifier: "segment",
                    items: [measureWithDateAfterOtherAttributes.buckets[1].items[0]],
                },
            ];

            const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
                measureWithDateAfterOtherAttributes,
            );

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        },
    );

    it('should disable possibility to add items to "segment by" for more than one measure in measures bucket', async () => {
        const lineChart = createComponent();

        const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
            twoMeasureBucketsReferencePoint,
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
                attributeInStackReferencePoint,
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
            const lineChart = createComponent(defaultProps);

            const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
                oneMetricAndCategoryAndStackReferencePoint,
            );

            const measures = extendedReferencePoint?.properties?.controls?.["secondary_yaxis"].measures;
            const axis = extendedReferencePoint?.uiConfig?.axis;
            expect(measures).toBeUndefined();
            expect(axis).toBeUndefined();
        });

        it("should add measures identifiers into properties which are set to secondary axis", async () => {
            const lineChart = createComponent(defaultProps);

            const extendedReferencePoint = await lineChart.getExtendedReferencePoint(
                multipleMetricsAndCategoriesReferencePoint,
            );

            const measures = extendedReferencePoint?.properties?.controls?.["secondary_yaxis"].measures;
            const axis = extendedReferencePoint?.uiConfig?.axis;
            expect(measures).toEqual(["m3", "m4"]);
            expect(axis).toEqual(AXIS.DUAL);
        });

        it("should update supported properties list base on axis type", async () => {
            const mockProps = {
                ...defaultProps,
                pushData: vi.fn(),
            };
            const chart = createComponent(mockProps);

            await chart.getExtendedReferencePoint(oneMetricAndCategoryAndStackReferencePoint);
            // TODO avoid testing protected property
            expect((chart as any).supportedPropertiesList).toEqual(
                LINE_CHART_SUPPORTED_PROPERTIES[AXIS.PRIMARY],
            );

            await chart.getExtendedReferencePoint(measuresOnSecondaryAxisAndAttributeReferencePoint);
            // TODO avoid testing protected property
            expect((chart as any).supportedPropertiesList).toEqual(
                LINE_CHART_SUPPORTED_PROPERTIES[AXIS.SECONDARY],
            );

            await chart.getExtendedReferencePoint(multipleMetricsAndCategoriesReferencePoint);
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
                    dateAsFirstCategoryReferencePoint,
                    {
                        buckets: [
                            dateAsFirstCategoryReferencePoint.buckets[0],
                            {
                                localIdentifier: "trend",
                                items: dateAsFirstCategoryReferencePoint.buckets[1].items.slice(0, 1),
                            },
                            {
                                localIdentifier: "segment",
                                items: dateAsFirstCategoryReferencePoint.buckets[1].items.slice(1, 2),
                            },
                        ],
                    },
                ],
                [
                    "from table to line chart: two identical dates in rows",
                    twoIdenticalDatesInRowsWithSingleMeasure,
                    {
                        buckets: [
                            twoIdenticalDatesInRowsWithSingleMeasure.buckets[0],
                            {
                                localIdentifier: "trend",
                                items: twoIdenticalDatesInRowsWithSingleMeasure.buckets[1].items.slice(0, 1),
                            },
                            {
                                localIdentifier: "segment",
                                items: twoIdenticalDatesInRowsWithSingleMeasure.buckets[1].items.slice(1, 2),
                            },
                        ],
                    },
                ],
                [
                    "from table to line chart: multiple dates in rows but not first (date should get preference)",
                    multipleDatesNotAsFirstReferencePointWithSingleMeasure,
                    {
                        buckets: [
                            multipleDatesNotAsFirstReferencePointWithSingleMeasure.buckets[0],
                            {
                                localIdentifier: "trend",
                                items: multipleDatesNotAsFirstReferencePointWithSingleMeasure.buckets[1].items.slice(
                                    1,
                                    2,
                                ),
                            },
                            {
                                localIdentifier: "segment",
                                items: multipleDatesNotAsFirstReferencePoint.buckets[1].items.slice(0, 1),
                            },
                        ],
                    },
                ],
                [
                    "from table to line chart: multiple dates in rows but not first, more measures",
                    multipleDatesNotAsFirstReferencePoint,
                    {
                        buckets: [
                            multipleDatesNotAsFirstReferencePoint.buckets[0],
                            {
                                localIdentifier: "trend",
                                items: multipleDatesNotAsFirstReferencePoint.buckets[1].items.slice(1, 2),
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
                    twoDatesInColumnChart,
                    {
                        buckets: [
                            twoDatesInColumnChart.buckets[0],
                            {
                                localIdentifier: "trend",
                                items: twoDatesInColumnChart.buckets[1].items.slice(0, 1),
                            },
                            {
                                localIdentifier: "segment",
                                items: twoDatesInColumnChart.buckets[2].items.slice(0, 1),
                            },
                        ],
                    },
                ],
                [
                    "from column to line chart: three dates",
                    threeDatesInColumnChart,
                    {
                        buckets: [
                            threeDatesInColumnChart.buckets[0],
                            {
                                localIdentifier: "trend",
                                items: threeDatesInColumnChart.buckets[1].items.slice(0, 1),
                            },
                            {
                                localIdentifier: "segment",
                                items: threeDatesInColumnChart.buckets[2].items.slice(0, 1),
                            },
                        ],
                    },
                ],
                [
                    "from column to line chart: first attribute is not date (date should get preference)",
                    multipleDatesNotAsFirstReferencePointWithSingleMeasureColumn,
                    {
                        buckets: [
                            multipleDatesNotAsFirstReferencePointWithSingleMeasureColumn.buckets[0],
                            {
                                localIdentifier: "trend",
                                items: multipleDatesNotAsFirstReferencePointWithSingleMeasureColumn.buckets[1].items.slice(
                                    1,
                                    2,
                                ),
                            },
                            {
                                localIdentifier: "segment",
                                items: multipleDatesNotAsFirstReferencePointWithSingleMeasureColumn.buckets[2].items.slice(
                                    0,
                                    1,
                                ),
                            },
                        ],
                    },
                ],
                [
                    "from column to line chart: date should be moved to segment by (should not prioritize dates in stacks)",
                    twoAttributesInViewAndOneDateInColumnsReferencePoint,
                    {
                        buckets: [
                            twoAttributesInViewAndOneDateInColumnsReferencePoint.buckets[0],
                            {
                                localIdentifier: "trend",
                                items: twoAttributesInViewAndOneDateInColumnsReferencePoint.buckets[1].items.slice(
                                    0,
                                    1,
                                ),
                            },
                            {
                                localIdentifier: "segment",
                                items: twoAttributesInViewAndOneDateInColumnsReferencePoint.buckets[2].items.slice(
                                    0,
                                    1,
                                ),
                            },
                        ],
                    },
                ],
                [
                    "from column to line chart: attribute should be moved to segment by",
                    datesInViewByAndAttributeInStackBy,
                    {
                        buckets: [
                            datesInViewByAndAttributeInStackBy.buckets[0],
                            {
                                localIdentifier: "trend",
                                items: datesInViewByAndAttributeInStackBy.buckets[1].items.slice(0, 1),
                            },
                            {
                                localIdentifier: "segment",
                                items: datesInViewByAndAttributeInStackBy.buckets[2].items.slice(0, 1),
                            },
                        ],
                    },
                ],
                [
                    "from column to line chart: date should not duplicate in view by",
                    onlyStackColumnChart,
                    {
                        buckets: [
                            onlyStackColumnChart.buckets[0],
                            {
                                localIdentifier: "trend",
                                items: [],
                            },
                            {
                                localIdentifier: "segment",
                                items: onlyStackColumnChart.buckets[2].items.slice(0, 1),
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
                    const lineChart = createComponent();

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
                Region.Default,
                targetUri,
                intersection,
                expectedInsightDefRegion,
            ],
            [
                "on viewby attribute",
                sourceInsightDef,
                Department.Default,
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

                const result: IInsight = chart.getInsightWithDrillDownApplied(
                    sourceInsight,
                    {
                        drillDefinition,
                        event: createDrillEvent("treemap", drillIntersection),
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
            ["1 M + 0 VB", oneMetricNoTrendByRefPoint],
            ["0 M + 1 VB", justTrendByRefPoint],
            ["1 M + 1 VB", oneMetricOneTrendBy],
            ["1 M + 2 VB", oneMetricAndTwoTrendByRefPoint],
            ["2 M + 1 VB", twoMetricAndOneTrendByRefPoint],
            ["2 M + 2 VB", twoMetricAndTwoTrendByRefPoint],
            ["2 stacked M + 1 VB", twoSegmentedMetricAndOneTrendByRefPoint],
            ["2 stacked M + 2 VB", twoSegmentedMetricAndTwoTrendByRefPoint],
            ["1 M + 1 VB + 1 SEG", oneMetricAndOneTrendAndOneSegmentByRefPoint],
            ["2 M + 1 VB + 1 SEG", twoMetricAndOneTrendAndOneSegmentByRefPoint],
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
