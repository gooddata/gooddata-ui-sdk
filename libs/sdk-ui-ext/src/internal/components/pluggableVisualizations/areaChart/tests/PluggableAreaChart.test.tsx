// (C) 2019-2026 GoodData Corporation

import { cloneDeep } from "lodash-es";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    type IAttribute,
    type IInsight,
    type IInsightDefinition,
    insightBucket,
    insightSetProperties,
} from "@gooddata/sdk-model";
import { BucketNames, type IDrillEventIntersectionElement } from "@gooddata/sdk-ui";
import { type IAreaChartProps } from "@gooddata/sdk-ui-charts";

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
    type IVisProps,
} from "../../../../interfaces/Visualization.js";
import {
    arithmeticMeasureItems,
    att1AndAtt2inViewByAndAtt3inStackBy,
    attributeAndDateInViewByAndDateInStackByReferencePoint,
    dateAndAttributeInViewByAndEmptyStackBy,
    dateAsSecondViewByItemReferencePoint,
    dateAsThirdCategoryReferencePointWithoutStack,
    dateAttributeOnRowsAndColumnsReferencePoint,
    dateAttributesOnRowsReferencePoint,
    dateInColumnsAndMultipleMeasuresTable,
    dateInColumnsAndMultipleMeasuresTreemap,
    emptyReferencePoint,
    justViewByReferencePoint,
    masterMeasureItems,
    mixOfMeasuresWithDerivedAndArithmeticFromDerivedAreaReferencePoint,
    multipleMetricsAndCategoriesReferencePoint,
    multipleMetricsOneStackByReferencePoint,
    oneDateInRowsAndOneDateInColumnsReferencePoint,
    oneDateInRowsAndSameOneDateInColumnsReferencePoint,
    oneMetricAndManyCategoriesAndOneStackRefPoint,
    oneMetricAndManyCategoriesReferencePoint,
    oneMetricAndOneCategoryAndOneStackRefPoint,
    oneMetricAndTwoCategoriesReferencePoint,
    oneMetricNoCategoriesReferencePoint,
    oneMetricOneCategory,
    oneStackAndNoCategoriesReferencePoint,
    stackMeasuresToPercentReferencePoint,
    tableTotalsReferencePoint,
    threeDatesInColumnsReferencePoint,
    twoAttributesAndDateInRowsAndOneDateInColumnsReferencePoint,
    twoDatesInRowsAndOneDateInColumnsReferencePoint,
    twoMetricAndOneCategoryRefPoint,
    twoMetricAndTwoCategoriesRefPoint,
    twoMetricsAndOneCategoryAndOneStackRefPoint,
    twoStackedMetricAndOneCategoryRefPoint,
    twoStackedMetricAndTwoCategoriesRefPoint,
} from "../../../../tests/mocks/referencePointMocks.js";
import {
    insightWithSingleMeasure,
    insightWithSingleMeasureAndTwoViewBy,
    insightWithSingleMeasureAndViewBy,
    insightWithTwoMeasuresAndViewBy,
} from "../../../../tests/mocks/testMocks.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../../utils/translations.js";
import {
    createDrillDefinition,
    createDrillEvent,
    getLastRenderEl,
    insightDefinitionToInsight,
} from "../../tests/pluggableVisualizations.test.helpers.js";
import { PluggableAreaChart } from "../PluggableAreaChart.js";

const { Department, Region } = ReferenceMd;

describe("PluggableAreaChart", () => {
    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();
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
        messages: DEFAULT_MESSAGES[DEFAULT_LANGUAGE],
    } as unknown as IVisConstruct;

    const executionFactory = dummyBackend().workspace("PROJECTID").execution();

    function createComponent(props = defaultProps) {
        return new PluggableAreaChart(props);
    }

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    it("should return reference point when no categories and only stacks", async () => {
        const areaChart = createComponent();

        const extendedReferencePoint = await areaChart.getExtendedReferencePoint(
            oneStackAndNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should cut out measures tail when getting nM 0Vb 1Sb", async () => {
        const baseChart = createComponent();

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            multipleMetricsOneStackByReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    describe("handling date items", () => {
        describe("with multiple dates", () => {
            const inputs: [string, IReferencePoint, Partial<IExtendedReferencePoint>][] = [
                [
                    "from table to area chart: date1 and date2 in rows ans date1 columns",
                    twoDatesInRowsAndOneDateInColumnsReferencePoint,
                    {
                        buckets: [
                            twoDatesInRowsAndOneDateInColumnsReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: twoDatesInRowsAndOneDateInColumnsReferencePoint.buckets[1].items.slice(
                                    0,
                                    2,
                                ),
                            },
                            {
                                localIdentifier: "stack",
                                items: [],
                            },
                        ],
                    },
                ],
                [
                    "from table to area chart: no dates but 2 attributes and 2 measures",
                    tableTotalsReferencePoint,
                    {
                        buckets: [
                            tableTotalsReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: tableTotalsReferencePoint.buckets[1].items.slice(0, 1),
                            },
                            {
                                localIdentifier: "stack",
                                items: [],
                            },
                        ],
                    },
                ],
                [
                    "from table to area chart: date1 in rows ans date2 columns",
                    oneDateInRowsAndOneDateInColumnsReferencePoint,
                    {
                        buckets: [
                            oneDateInRowsAndOneDateInColumnsReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: [
                                    oneDateInRowsAndOneDateInColumnsReferencePoint.buckets[1].items[0],
                                    oneDateInRowsAndOneDateInColumnsReferencePoint.buckets[2].items[0],
                                ],
                            },
                            {
                                localIdentifier: "stack",
                                items: [],
                            },
                        ],
                    },
                ],
                [
                    "from table to area chart: date1 in rows ans date1 columns",
                    oneDateInRowsAndSameOneDateInColumnsReferencePoint,
                    {
                        buckets: [
                            oneDateInRowsAndSameOneDateInColumnsReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: [
                                    oneDateInRowsAndSameOneDateInColumnsReferencePoint.buckets[1].items[0],
                                    oneDateInRowsAndSameOneDateInColumnsReferencePoint.buckets[2].items[0],
                                ],
                            },
                            {
                                localIdentifier: "stack",
                                items: [],
                            },
                        ],
                    },
                ],
                [
                    "from table to area chart: att1 and att2 and date1 in rows ans date2 in columns",
                    twoAttributesAndDateInRowsAndOneDateInColumnsReferencePoint,
                    {
                        buckets: [
                            twoAttributesAndDateInRowsAndOneDateInColumnsReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: [
                                    twoAttributesAndDateInRowsAndOneDateInColumnsReferencePoint.buckets[1]
                                        .items[0],
                                    twoAttributesAndDateInRowsAndOneDateInColumnsReferencePoint.buckets[1]
                                        .items[1],
                                ],
                            },
                            {
                                localIdentifier: "stack",
                                items: [],
                            },
                        ],
                    },
                ],
                [
                    "from table to area chart: date1 and date2 and date1 in columns",
                    threeDatesInColumnsReferencePoint,
                    {
                        buckets: [
                            threeDatesInColumnsReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: [
                                    threeDatesInColumnsReferencePoint.buckets[2].items[0],
                                    threeDatesInColumnsReferencePoint.buckets[2].items[1],
                                ],
                            },
                            {
                                localIdentifier: "stack",
                                items: [],
                            },
                        ],
                    },
                ],
                [
                    "from table to area chart: multiple measures and date in columns",
                    dateInColumnsAndMultipleMeasuresTable,
                    {
                        buckets: [
                            dateInColumnsAndMultipleMeasuresTable.buckets[0],
                            {
                                localIdentifier: "view",
                                items: [dateInColumnsAndMultipleMeasuresTable.buckets[2].items[0]],
                            },
                            {
                                localIdentifier: "stack",
                                items: [],
                            },
                        ],
                    },
                ],
                [
                    "from treemap to area chart: multiple measures and date in segment",
                    dateInColumnsAndMultipleMeasuresTreemap,
                    {
                        buckets: [
                            {
                                localIdentifier: "measures",
                                items: dateInColumnsAndMultipleMeasuresTreemap.buckets[0].items.slice(0, 1),
                            },
                            {
                                localIdentifier: "view",
                                items: [],
                            },
                            {
                                localIdentifier: "stack",
                                items: [dateInColumnsAndMultipleMeasuresTreemap.buckets[2].items[0]],
                            },
                        ],
                    },
                ],
                [
                    "from colum chart to area chart: att1 and date1 in viewBy and date2 in stackBy",
                    attributeAndDateInViewByAndDateInStackByReferencePoint,
                    {
                        buckets: [
                            attributeAndDateInViewByAndDateInStackByReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: [
                                    attributeAndDateInViewByAndDateInStackByReferencePoint.buckets[1]
                                        .items[0],
                                ],
                            },
                            {
                                localIdentifier: "stack",
                                items: [
                                    attributeAndDateInViewByAndDateInStackByReferencePoint.buckets[2]
                                        .items[0],
                                ],
                            },
                        ],
                    },
                ],
                [
                    "from colum chart to area chart: att1 and date1 in viewBy and empty stackBy",
                    dateAsSecondViewByItemReferencePoint,
                    {
                        buckets: [
                            dateAsSecondViewByItemReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: [
                                    dateAsSecondViewByItemReferencePoint.buckets[1].items[0],
                                    dateAsSecondViewByItemReferencePoint.buckets[1].items[1],
                                ],
                            },
                            {
                                localIdentifier: "stack",
                                items: [],
                            },
                        ],
                    },
                ],
                [
                    "from colum chart to area chart: date1 and att1 in viewBy and empty stackBy",
                    dateAndAttributeInViewByAndEmptyStackBy,
                    {
                        buckets: [
                            dateAndAttributeInViewByAndEmptyStackBy.buckets[0],
                            {
                                localIdentifier: "view",
                                items: [
                                    dateAndAttributeInViewByAndEmptyStackBy.buckets[1].items[0],
                                    dateAndAttributeInViewByAndEmptyStackBy.buckets[1].items[1],
                                ],
                            },
                            {
                                localIdentifier: "stack",
                                items: [],
                            },
                        ],
                    },
                ],
                [
                    "from colum chart to area chart: att1 and att2 in viewBy and att3 stackBy",
                    att1AndAtt2inViewByAndAtt3inStackBy,
                    {
                        buckets: [
                            att1AndAtt2inViewByAndAtt3inStackBy.buckets[0],
                            {
                                localIdentifier: "view",
                                items: [att1AndAtt2inViewByAndAtt3inStackBy.buckets[1].items[0]],
                            },
                            {
                                localIdentifier: "stack",
                                items: [att1AndAtt2inViewByAndAtt3inStackBy.buckets[2].items[0]],
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
                    const areaChart = createComponent();

                    const referencePoint = await areaChart.getExtendedReferencePoint(inputReferencePoint);
                    expect(referencePoint).toMatchObject(expectedReferencePoint);
                },
            );
        });

        it("should keep two date attributes in view by bucket when comming from pivot table with only one dimension", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = dateAttributeOnRowsAndColumnsReferencePoint;
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items,
                },
                {
                    localIdentifier: "view",
                    items: [...mockRefPoint.buckets[1].items, ...mockRefPoint.buckets[2].items],
                },
                {
                    localIdentifier: "stack",
                    items: [],
                },
            ];
            const extendedReferencePoint = await areaChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        });

        it("should keep two date attributes in view by bucket when coming from pivot table with date buckets with different date dimensions", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = cloneDeep(dateAttributesOnRowsReferencePoint);
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items,
                },
                {
                    localIdentifier: "view",
                    items: [mockRefPoint.buckets[1].items[0], mockRefPoint.buckets[1].items[1]],
                },
                {
                    localIdentifier: "stack",
                    items: [],
                },
            ];
            const extendedReferencePoint = await areaChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        });
    });

    describe("optional stacking", () => {
        const options: IVisProps = {
            dimensions: { height: 5 },
            locale: "en-US",
            custom: {},
            messages: DEFAULT_MESSAGES[DEFAULT_LANGUAGE],
        };
        const emptyPropertiesMeta = {};

        const verifyStackMeasuresConfig = (chart: PluggableAreaChart, stackMeasures: boolean) => {
            const visualizationProperties =
                stackMeasures === null
                    ? {}
                    : {
                          controls: {
                              stackMeasures,
                          },
                      };
            const testInsight = insightSetProperties(
                insightWithSingleMeasureAndViewBy,
                visualizationProperties,
            );
            const measureBucket = insightBucket(testInsight, BucketNames.MEASURES);
            const expected = stackMeasures === null ? measureBucket!.items.length > 1 : stackMeasures;
            chart.update(options, testInsight, emptyPropertiesMeta, executionFactory);

            const renderEl = getLastRenderEl<IAreaChartProps>(mockRenderFun, mockElement);
            expect(renderEl!.props.config!.stackMeasures).toBe(expected);
        };

        it("should modify stack by default of area by config stackMeasures properties", () => {
            const areaChart = createComponent();

            verifyStackMeasuresConfig(areaChart, null as unknown as boolean);
            verifyStackMeasuresConfig(areaChart, true);
            verifyStackMeasuresConfig(areaChart, false);
        });

        it("should modify stackMeasures and stackMeasuresToPercent properties from true to false", () => {
            const areaChart = createComponent();

            const visualizationProperties = {
                properties: {
                    controls: {
                        stackMeasures: true,
                        stackMeasuresToPercent: true,
                    },
                },
            };

            const testInsight = insightSetProperties(
                insightWithSingleMeasureAndTwoViewBy,
                visualizationProperties,
            );

            areaChart.update(options, testInsight, emptyPropertiesMeta, executionFactory);

            const renderEl = getLastRenderEl<IAreaChartProps>(mockRenderFun, mockElement);
            expect(renderEl!.props.config!.stackMeasures).toBe(false);
            expect(renderEl!.props.config!.stackMeasuresToPercent).toBe(false);
        });

        it("should reset custom controls properties", () => {
            const areaChart = createComponent();

            const visualizationProperties = {
                controls: {
                    stackMeasures: true,
                    stackMeasuresToPercent: true,
                },
            };
            areaChart.setCustomControlsProperties({
                stackMeasures: false,
                stackMeasuresToPercent: false,
            });

            const testInsight = insightSetProperties(
                insightWithTwoMeasuresAndViewBy,
                visualizationProperties,
            );

            areaChart.update(options, testInsight, emptyPropertiesMeta, executionFactory);

            const renderEl = getLastRenderEl<IAreaChartProps>(mockRenderFun, mockElement);
            expect(renderEl!.props.config!.stackMeasures).toBe(true);
            expect(renderEl!.props.config!.stackMeasuresToPercent).toBe(true);
        });

        it("should reuse one measure, only one category and one category as stack", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = oneMetricAndManyCategoriesAndOneStackRefPoint;

            const extendedReferencePoint = await areaChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toMatchSnapshot();
        });

        it("should reuse one measure, two categories and no category as stack", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = oneMetricAndManyCategoriesReferencePoint;

            const extendedReferencePoint = await areaChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toMatchSnapshot();
        });

        it("should reuse all measures, only one category and no stacks", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = multipleMetricsAndCategoriesReferencePoint;

            const extendedReferencePoint = await areaChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toMatchSnapshot();
        });

        it("should return reference point with Date in categories even it was as third item", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = dateAsThirdCategoryReferencePointWithoutStack;

            const extendedReferencePoint = await areaChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toMatchSnapshot();
        });

        it("stackMeasures should be selected when select stackMeasuresToPercent", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = stackMeasuresToPercentReferencePoint;

            const extendedReferencePoint = await areaChart.getExtendedReferencePoint(mockRefPoint);
            expect(extendedReferencePoint.properties!.controls).toEqual({
                stackMeasures: true,
                stackMeasuresToPercent: true,
            });
        });

        it("should keep date item as second view by item", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = dateAsSecondViewByItemReferencePoint;
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items,
                },
                {
                    localIdentifier: "view",
                    items: mockRefPoint.buckets[1].items,
                },
                {
                    localIdentifier: "stack",
                    items: [],
                },
            ];

            const extendedReferencePoint = await areaChart.getExtendedReferencePoint(mockRefPoint);
            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        });
    });

    describe("Over Time Comparison", () => {
        it("should return reference point containing uiConfig with no supported comparison types", async () => {
            const component = createComponent();

            const extendedReferencePoint = await component.getExtendedReferencePoint(emptyReferencePoint);

            expect(extendedReferencePoint.uiConfig!.supportedOverTimeComparisonTypes).toEqual([]);
        });

        it("should remove all derived measures and arithmetic measures created from derived measures", async () => {
            const component = createComponent();

            const extendedReferencePoint = await component.getExtendedReferencePoint(
                mixOfMeasuresWithDerivedAndArithmeticFromDerivedAreaReferencePoint,
            );
            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [
                        masterMeasureItems[0],
                        masterMeasureItems[1],
                        arithmeticMeasureItems[0],
                        arithmeticMeasureItems[1],
                    ],
                },
                {
                    localIdentifier: "view",
                    items: [],
                },
                {
                    localIdentifier: "stack",
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
            ["1 M + 0 VB", oneMetricNoCategoriesReferencePoint],
            ["0 M + 1 VB", justViewByReferencePoint],
            ["1 M + 1 VB", oneMetricOneCategory],
            ["1 M + 2 VB", oneMetricAndTwoCategoriesReferencePoint],
            ["2 M + 1 VB", twoMetricAndOneCategoryRefPoint],
            ["2 M + 2 VB", twoMetricAndTwoCategoriesRefPoint],
            ["2 stacked M + 1 VB", twoStackedMetricAndOneCategoryRefPoint],
            ["2 stacked M + 2 VB", twoStackedMetricAndTwoCategoriesRefPoint],
            ["1 M + 1 VB + 1 ST", oneMetricAndOneCategoryAndOneStackRefPoint],
            ["2 M + 1 VB + 1 ST", twoMetricsAndOneCategoryAndOneStackRefPoint],
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

            visualization.update(
                { messages: DEFAULT_MESSAGES[DEFAULT_LANGUAGE] },
                insightWithSingleMeasure,
                {},
                executionFactory,
            );

            // 1st call for rendering element
            // 2nd call for rendering config panel
            expect(mockRenderFun).toHaveBeenCalledTimes(2);
            expect(getLastRenderEl(mockRenderFun, mockElement)).toBeDefined();
            expect(getLastRenderEl(mockRenderFun, mockConfigElement)).toBeDefined();
        });
    });
});
