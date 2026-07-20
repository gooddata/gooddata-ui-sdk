// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IAttribute, type IInsight, type IInsightDefinition } from "@gooddata/sdk-model";
import { type IDrillEventIntersectionElement, OverTimeComparisonTypes } from "@gooddata/sdk-ui";

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
    multipleDatesNotAsFirstReferencePoint,
    multipleDatesNotAsFirstReferencePointWithSingleMeasure,
    multipleMetricsAndCategoriesReferencePoint,
    oneMetricAndCategoryAndStackReferencePoint,
    oneMetricAndOneTrendAndOneSegmentByRefPoint,
    oneMetricNoTrendByRefPoint,
    oneMetricOneTrendBy,
    samePeriodPreviousYearAndAttributesRefPoint,
    twoDatesInColumnChart,
    twoMeasureBucketsReferencePoint,
    twoMetricAndOneTrendAndOneSegmentByRefPoint,
    twoMetricAndOneTrendByRefPoint,
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
import { PluggableRadarChart } from "../PluggableRadarChart.js";

const { Department, Region } = ReferenceMd;

describe("PluggableRadarChart", () => {
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
        return new PluggableRadarChart(props);
    }

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    it("should reuse all measures, only one category and no segment", async () => {
        const chart = createComponent();

        const extendedReferencePoint = await chart.getExtendedReferencePoint(
            multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with one trend and one segment", async () => {
        const chart = createComponent();

        const extendedReferencePoint = await chart.getExtendedReferencePoint(
            oneMetricAndCategoryAndStackReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with Date in trend even when it was the second attribute", async () => {
        const chart = createComponent();

        const extendedReferencePoint = await chart.getExtendedReferencePoint(
            dateAsSecondCategoryReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it(
        "should remove derived measure and place date to trend and first other attribute to segment " +
            "when single measure with comparison is applied and date is first attribute",
        async () => {
            const chart = createComponent();

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

            const extendedReferencePoint = await chart.getExtendedReferencePoint(
                samePeriodPreviousYearAndAttributesRefPoint,
            );

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        },
    );

    it('should disable possibility to add items to "segment by" for more than one measure in measures bucket', async () => {
        const chart = createComponent();

        const extendedReferencePoint = await chart.getExtendedReferencePoint(twoMeasureBucketsReferencePoint);

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
        'should enable possibility to add items to "segment by" when already occupied ' +
            "so item can be replaced even when more than one measure is present",
        async () => {
            const chart = createComponent();

            const extendedReferencePoint = await chart.getExtendedReferencePoint(
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

    describe("Supported properties", () => {
        it("should return reference point with only supported properties", async () => {
            const chart = createComponent();

            const referencePoint: IReferencePoint = {
                ...oneMetricOneTrendBy,
                properties: {
                    controls: {
                        forecast: { enabled: true, period: 3, confidence: 0.95 },
                        xaxis: {
                            rotation: "60",
                            visible: false,
                            labelsEnabled: false,
                            name: { visible: false, position: "left" },
                        },
                        yaxis: {
                            rotation: "30",
                            visible: false,
                            labelsEnabled: false,
                            min: "0",
                            max: "100",
                            name: { visible: false, position: "center" },
                        },
                        grid: { enabled: false },
                    },
                },
            };

            const extendedReferencePoint = await chart.getExtendedReferencePoint(referencePoint);

            expect(extendedReferencePoint.properties?.controls).toEqual({
                xaxis: { labelsEnabled: false },
                yaxis: { labelsEnabled: false, min: "0", max: "100" },
                grid: { enabled: false },
            });
        });
    });

    describe("Over Time Comparison", () => {
        it("should return reference point containing uiConfig with PP, SP supported comparison types", async () => {
            const chart = createComponent();

            const extendedReferencePoint = await chart.getExtendedReferencePoint(emptyReferencePoint);

            expect(extendedReferencePoint.uiConfig!.supportedOverTimeComparisonTypes).toEqual([
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            ]);
        });
    });

    describe("handling date items", () => {
        describe("with multiple dates", () => {
            const inputs: [string, IReferencePoint, Partial<IExtendedReferencePoint>][] = [
                [
                    "from table: date and attribute in rows",
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
                    "from table: multiple dates in rows but not first (date should get preference)",
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
                    "from table: multiple dates in rows but not first, more measures",
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
                    "from column: two dates",
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
                    "from column: attribute should be moved to segment by",
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
                        event: createDrillEvent("radar", drillIntersection),
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
            ["2 M + 1 VB", twoMetricAndOneTrendByRefPoint],
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
