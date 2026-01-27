// (C) 2019-2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    type IAttribute,
    type IInsight,
    type IInsightDefinition,
    insightSetProperties,
} from "@gooddata/sdk-model";
import { type IDrillEventIntersectionElement } from "@gooddata/sdk-ui";

import {
    expectedInsightDefinitionDrillToRegion,
    expectedInsightDefinitionWithStackByDrillToDepartment,
    expectedInsightDefinitionWithStackByDrillToRegion,
    insightDefinition,
    insightDefinitionWithStackBy,
    intersection,
    targetUri,
} from "./getInsightWithDrillDownAppliedMock.js";
import {
    createDrillDefinition,
    createDrillEvent,
    insightDefinitionToInsight,
} from "./pluggableVisualizations.test.helpers.js";
import { AXIS } from "../../../constants/axis.js";
import {
    COLUMN_CHART_SUPPORTED_PROPERTIES,
    OPTIONAL_STACKING_PROPERTIES,
} from "../../../constants/supportedProperties.js";
import {
    type IBucketOfFun,
    type IExtendedReferencePoint,
    type IReferencePoint,
    type IVisConstruct,
    type IVisProps,
} from "../../../interfaces/Visualization.js";
import {
    dateAsFirstCategoryReferencePoint,
    dateAttributeOnRowsAndColumnsReferencePoint,
    measureWithDerivedAsFirstWithDateInStackRefPoint,
    measuresOnSecondaryAxisAndAttributeReferencePoint,
    multipleDatesInRowsOnly,
    multipleDatesNotAsFirstReferencePoint,
    multipleDatesNotAsFirstReferencePointWithSingleMeasure,
    multipleMeasureAndDateInRowsAndColumReferencePoint,
    multipleMetricsAndCategoriesReferencePoint,
    multipleMetricsOneStackByReferencePoint,
    oneMeasuresOneCategoryOneStackItemWithStackMeasuresToPercent,
    oneMeasuresOneCategoryWithStackMeasuresToPercent,
    oneMetricAndCategoryAndStackReferencePoint,
    oneMetricAndManyCategoriesAndOneStackRefPoint,
    oneMetricAndManyCategoriesReferencePoint,
    onlyStackTreemapMultipleMeasures,
    threeDifferentDatesReferencePoint,
    twoIdenticalDatesInRows,
    twoMeasuresOneCategoryWithStackMeasuresToPercent,
} from "../../../tests/mocks/referencePointMocks.js";
import {
    insightWithSingleMeasureAndTwoViewBy,
    insightWithTwoMeasuresAndViewBy,
} from "../../../tests/mocks/testMocks.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../utils/translations.js";
import { PluggableColumnChart } from "../columnChart/PluggableColumnChart.js";

const { Department, Region } = ReferenceMd;

describe("PluggableColumnBarCharts", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    const defaultProps: IVisConstruct = {
        projectId: "PROJECTID",
        element: () => document.querySelector("body"),
        configPanelElement: (): HTMLElement | null => null,
        callbacks: {
            afterRender: () => {},
            pushData: () => {},
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: () => {},
        messages,
    } as unknown as IVisConstruct;

    function createComponent(props = defaultProps) {
        return new PluggableColumnChart(props);
    }

    const executionFactory = dummyBackend({ hostname: "test", raiseNoDataExceptions: "without-data-view" })
        .workspace("PROJECTID")
        .execution();

    describe("optional stacking", () => {
        const options: IVisProps = {
            dimensions: { height: undefined },
            locale: "en-US",
            custom: {},
            messages,
        };
        const emptyPropertiesMeta = {};

        it("should place third attribute to stack bucket", async () => {
            const columnChart = createComponent(defaultProps);
            const mockRefPoint = oneMetricAndManyCategoriesReferencePoint;

            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toMatchSnapshot();
        });

        it("should reuse one measure, two categories and one category as stack", async () => {
            const columnChart = createComponent(defaultProps);
            const mockRefPoint = oneMetricAndManyCategoriesAndOneStackRefPoint;

            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toMatchSnapshot();
        });

        it("should reuse all measures, two categories and no stack", async () => {
            const columnChart = createComponent(defaultProps);
            const mockRefPoint = multipleMetricsAndCategoriesReferencePoint;

            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toMatchSnapshot();
        });

        it("should return reference point without Date in stacks", async () => {
            const columnChart = createComponent(defaultProps);
            const mockRefPoint = dateAsFirstCategoryReferencePoint;

            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toMatchSnapshot();
        });

        it("should cut out measures tail when getting many measures, no category and one stack", async () => {
            const columnChart = createComponent(defaultProps);
            const mockRefPoint = multipleMetricsOneStackByReferencePoint;

            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toMatchSnapshot();
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
                COLUMN_CHART_SUPPORTED_PROPERTIES[AXIS.PRIMARY].filter(
                    (props: string) => props !== OPTIONAL_STACKING_PROPERTIES[0],
                ),
            );

            await chart.getExtendedReferencePoint(measuresOnSecondaryAxisAndAttributeReferencePoint);
            // TODO avoid testing protected property
            expect((chart as any).supportedPropertiesList).toEqual(
                COLUMN_CHART_SUPPORTED_PROPERTIES[AXIS.SECONDARY],
            );

            await chart.getExtendedReferencePoint(multipleMetricsAndCategoriesReferencePoint);
            // TODO avoid testing protected property
            expect((chart as any).supportedPropertiesList).toEqual(
                COLUMN_CHART_SUPPORTED_PROPERTIES[AXIS.DUAL],
            );
        });

        it("should disable open as report for insight have two view items", () => {
            const visualization = createComponent(defaultProps);
            visualization.update(
                options,
                insightWithSingleMeasureAndTwoViewBy,
                emptyPropertiesMeta,
                executionFactory,
            );
            const isOpenAsReportSupported = visualization.isOpenAsReportSupported();
            expect(isOpenAsReportSupported).toBe(false);
        });

        it("should disable open as report for insight have properties stackMeasures", () => {
            const visualization = createComponent(defaultProps);

            // stackMeasures property
            const visualizationProperties = {
                controls: {
                    stackMeasures: true,
                },
            };
            const testInsight = insightSetProperties(
                insightWithTwoMeasuresAndViewBy,
                visualizationProperties,
            );

            visualization.update(options, testInsight, emptyPropertiesMeta, executionFactory);
            const isOpenAsReportSupported = visualization.isOpenAsReportSupported();
            expect(isOpenAsReportSupported).toBe(false);
        });

        it("should disable open as report for insight have properties stackMeasuresToPercent", () => {
            const visualization = createComponent(defaultProps);

            // stackMeasuresToPercent property
            const visualizationProperties = {
                controls: {
                    stackMeasuresToPercent: true,
                },
            };
            const testInsight = insightSetProperties(
                insightWithTwoMeasuresAndViewBy,
                visualizationProperties,
            );

            visualization.update(options, testInsight, emptyPropertiesMeta, executionFactory);
            const isOpenAsReportSupported = visualization.isOpenAsReportSupported();
            expect(isOpenAsReportSupported).toBe(false);
        });

        it("should enable open as report for normal column chart", () => {
            const visualization = createComponent(defaultProps);

            visualization.update(
                options,
                insightWithTwoMeasuresAndViewBy,
                emptyPropertiesMeta,
                executionFactory,
            );
            const isOpenAsReportSupported = visualization.isOpenAsReportSupported();
            expect(isOpenAsReportSupported).toBe(true);
        });

        it("should retain stacking config after adding new measure", async () => {
            const columnChart = createComponent(defaultProps);

            // step1: init column chart with 1M, 1VB, 1SB with 'Stack to 100%' enabled
            const initialState = oneMeasuresOneCategoryOneStackItemWithStackMeasuresToPercent;
            let extendedReferencePoint = await columnChart.getExtendedReferencePoint(initialState);
            // 'Stack to 100%' checkbox is checked
            expect(extendedReferencePoint.properties!.controls).toEqual({
                stackMeasuresToPercent: true,
            });

            // step2: remove StackBy item
            const stateWithStackByItemRemoved = oneMeasuresOneCategoryWithStackMeasuresToPercent;
            extendedReferencePoint = await columnChart.getExtendedReferencePoint(stateWithStackByItemRemoved);
            // 'Stack to 100%' and 'Stack Measures' checkboxes are hidden
            expect(extendedReferencePoint.properties!.controls).toBeFalsy();

            // step3: add one more measure
            const stateWithNewMeasureAdded = twoMeasuresOneCategoryWithStackMeasuresToPercent;
            extendedReferencePoint = await columnChart.getExtendedReferencePoint(stateWithNewMeasureAdded);
            // column chart should be stacked in percent with 'Stack to 100%' and 'Stack Measures' checkboxes are checked
            expect(extendedReferencePoint.properties!.controls).toEqual({
                stackMeasures: true,
                stackMeasuresToPercent: true,
            });
        });
    });

    describe("handling date items", () => {
        describe("with multiple dates", () => {
            const inputs: [string, IReferencePoint, Partial<IExtendedReferencePoint>][] = [
                [
                    "from table to column chart: date in rows only",
                    dateAsFirstCategoryReferencePoint,
                    {
                        buckets: [
                            dateAsFirstCategoryReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: dateAsFirstCategoryReferencePoint.buckets[1].items,
                            },
                            {
                                localIdentifier: "stack",
                                items: [],
                            },
                        ],
                    },
                ],
                [
                    "from table to column chart: three different dates",
                    threeDifferentDatesReferencePoint,
                    {
                        buckets: [
                            threeDifferentDatesReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: threeDifferentDatesReferencePoint.buckets[1].items.slice(0, 1),
                            },
                            {
                                localIdentifier: "stack",
                                items: threeDifferentDatesReferencePoint.buckets[1].items.slice(1, 2),
                            },
                        ],
                    },
                ],
                [
                    "from table to column chart: two identical dates in rows",
                    twoIdenticalDatesInRows,
                    {
                        buckets: [
                            twoIdenticalDatesInRows.buckets[0],
                            {
                                localIdentifier: "view",
                                items: twoIdenticalDatesInRows.buckets[1].items,
                            },
                            {
                                localIdentifier: "stack",
                                items: twoIdenticalDatesInRows.buckets[2].items,
                            },
                        ],
                    },
                ],
                [
                    "from table to column chart: multiple dates in rows",
                    multipleDatesInRowsOnly,
                    {
                        buckets: [
                            multipleDatesInRowsOnly.buckets[0],
                            {
                                localIdentifier: "view",
                                items: multipleDatesInRowsOnly.buckets[1].items.slice(0, 2),
                            },
                            {
                                localIdentifier: "stack",
                                items: multipleDatesInRowsOnly.buckets[1].items.slice(2, 3),
                            },
                        ],
                    },
                ],
                [
                    "from chart to column chart: multiple dates in rows but not first (more measures)",
                    multipleDatesNotAsFirstReferencePoint,
                    {
                        buckets: [
                            multipleDatesNotAsFirstReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: multipleDatesNotAsFirstReferencePoint.buckets[1].items.slice(0, 2),
                            },
                            {
                                localIdentifier: "stack",
                                items: [],
                            },
                        ],
                    },
                ],
                [
                    "from chart to column chart: multiple dates in rows but not first (single measure)",
                    multipleDatesNotAsFirstReferencePointWithSingleMeasure,
                    {
                        buckets: [
                            multipleDatesNotAsFirstReferencePointWithSingleMeasure.buckets[0],
                            {
                                localIdentifier: "view",
                                items: multipleDatesNotAsFirstReferencePointWithSingleMeasure.buckets[1].items.slice(
                                    0,
                                    2,
                                ),
                            },
                            {
                                localIdentifier: "stack",
                                items: multipleDatesNotAsFirstReferencePointWithSingleMeasure.buckets[1].items.slice(
                                    2,
                                ),
                            },
                        ],
                    },
                ],
                [
                    "from table to column chart: multiple measures and date in stack",
                    multipleMeasureAndDateInRowsAndColumReferencePoint,
                    {
                        buckets: [
                            multipleMeasureAndDateInRowsAndColumReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: multipleMeasureAndDateInRowsAndColumReferencePoint.buckets[1].items,
                            },
                            {
                                localIdentifier: "stack",
                                items: [],
                            },
                        ],
                    },
                ],
                [
                    "from treemap to column chart: multiple measures and date in stack: should limit measures to one",
                    onlyStackTreemapMultipleMeasures,
                    {
                        buckets: [
                            {
                                localIdentifier: "measures",
                                items: onlyStackTreemapMultipleMeasures.buckets[0].items.slice(0, 1),
                            },
                            {
                                localIdentifier: "view",
                                items: [],
                            },
                            {
                                localIdentifier: "stack",
                                items: onlyStackTreemapMultipleMeasures.buckets[2].items,
                            },
                        ],
                    },
                ],
                [
                    "Simulate adding pop measure:  With measure and derived measure and two date in view and date in stack",
                    measureWithDerivedAsFirstWithDateInStackRefPoint,
                    {
                        buckets: [
                            {
                                localIdentifier: "measures",
                                items: [measureWithDerivedAsFirstWithDateInStackRefPoint.buckets[0].items[1]],
                            },
                            {
                                localIdentifier: "view",
                                items: measureWithDerivedAsFirstWithDateInStackRefPoint.buckets[1].items,
                            },
                            {
                                localIdentifier: "stack",
                                items: measureWithDerivedAsFirstWithDateInStackRefPoint.buckets[2].items,
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
                    const columnChart = createComponent();

                    const referencePoint = await columnChart.getExtendedReferencePoint(inputReferencePoint);
                    expect(referencePoint).toMatchObject(expectedReferencePoint);
                },
            );
        });

        it("should keep two date attributes in view by bucket when coming from pivot table with only one dimension", async () => {
            const columnChart = createComponent(defaultProps);
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
            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        });
    });

    describe("Drill Down", () => {
        it.each([
            [
                "on viewby when stacks present",
                insightDefinitionWithStackBy,
                Department.Default,
                targetUri,
                intersection,
                expectedInsightDefinitionWithStackByDrillToDepartment,
            ],
            [
                "on stackby when stacks present",
                insightDefinitionWithStackBy,
                Region.Default,
                targetUri,
                intersection,
                expectedInsightDefinitionWithStackByDrillToRegion,
            ],
            [
                "on viewby when stacks not present",
                insightDefinition,
                Region.Default,
                targetUri,
                intersection,
                expectedInsightDefinitionDrillToRegion,
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
                const columnChart = createComponent();
                const drillDefinition = createDrillDefinition(drillSourceAttribute, drillTargetUri);
                const sourceInsight = insightDefinitionToInsight(sourceInsightDefinition, "first", "first");
                const expectedInsight = insightDefinitionToInsight(
                    expectedInsightDefinition,
                    "first",
                    "first",
                );

                const result: IInsight = columnChart.getInsightWithDrillDownApplied(
                    sourceInsight,
                    {
                        drillDefinition,
                        event: createDrillEvent("column", drillIntersection),
                    },
                    true,
                );

                expect(result).toEqual(expectedInsight);
            },
        );
    });
});
