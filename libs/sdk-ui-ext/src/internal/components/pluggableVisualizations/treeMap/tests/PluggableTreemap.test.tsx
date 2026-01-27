// (C) 2019-2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IAttribute, type IInsight, type IInsightDefinition } from "@gooddata/sdk-model";
import { DefaultLocale, type IDrillEventIntersectionElement } from "@gooddata/sdk-ui";

import {
    expectedInsightDefDepartment,
    expectedInsightDefRegion,
    intersection,
    sourceInsightDef,
    targetUri,
} from "./getInsightWithDrillDownAppliedMock.js";
import {
    type IExtendedReferencePoint,
    type IReferencePoint,
    type IVisConstruct,
} from "../../../../interfaces/Visualization.js";
import {
    arithmeticMeasureItems,
    dateAsFirstCategoryReferencePoint,
    emptyReferencePoint,
    masterMeasureItems,
    mixOfMeasuresWithDerivedAndArithmeticFromDerivedTreeMapReferencePoint,
    multipleDatesNotAsFirstReferencePoint,
    multipleDatesNotAsFirstReferencePointWithSingleMeasure,
    multipleMetricsAndCategoriesReferencePoint,
    multipleMetricsNoCategoriesReferencePoint,
    multipleMetricsOneStackByReferencePoint,
    oneMetricNoCategoriesReferencePoint,
    onlyStackColumnChart,
    samePeriodPreviousYearAndAttributesRefPoint,
    simpleStackedReferencePoint,
    threeDatesInColumnChart,
    twoDatesInColumnChart,
    twoIdenticalDatesInRowsWithSingleMeasure,
} from "../../../../tests/mocks/referencePointMocks.js";
import { insightWithSingleMeasure } from "../../../../tests/mocks/testMocks.js";
import { DEFAULT_MESSAGES } from "../../../../utils/translations.js";
import {
    createDrillDefinition,
    createDrillEvent,
    getLastRenderEl,
    insightDefinitionToInsight,
} from "../../tests/pluggableVisualizations.test.helpers.js";
import { PluggableTreemap } from "../PluggableTreemap.js";

const { Department, Region } = ReferenceMd;

describe("PluggableTreemap", () => {
    const messages = DEFAULT_MESSAGES[DefaultLocale as keyof typeof DEFAULT_MESSAGES];

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
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: mockRenderFun,
        messages,
    } as unknown as IVisConstruct;

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    function createComponent(props: IVisConstruct = defaultProps) {
        return new PluggableTreemap(props);
    }

    it("should create visualization", () => {
        const visualization = createComponent();

        expect(visualization).toBeTruthy();
    });

    it("should return ref. point with 1 M, 1 Vb, 1 Sb and only valid filters for 1 M, 1 Vb, 1 Sb", async () => {
        const treemap = createComponent();

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(simpleStackedReferencePoint);

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return ref. point with 1 M, 1 Vb, 1 Sb and only valid filters for n M, n Vb, 0 Sb", async () => {
        const treemap = createComponent();

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(
            multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return ref. point with 1 M, 1 Vb, 1 Sb and only valid filters for n M, n Attrs", async () => {
        const treemap = createComponent();

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(
            samePeriodPreviousYearAndAttributesRefPoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return ref. point with n M, 0 Vb, 0 Sb for n M, 0 Attr", async () => {
        const treemap = createComponent();

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(
            multipleMetricsNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with 1 M, 0 Vb, 0 Sb for 1 M, 0 Vb, 0 Sb", async () => {
        const treemap = createComponent();

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(
            oneMetricNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return ref. point with n M, 0 Vb, 1 Sb for n M, 0 Vb, 1 Sb", async () => {
        const treemap = createComponent();

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(
            multipleMetricsOneStackByReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
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
                mixOfMeasuresWithDerivedAndArithmeticFromDerivedTreeMapReferencePoint,
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

    describe("handling date items", () => {
        describe("with multiple dates", () => {
            const inputs: [string, IReferencePoint, Partial<IExtendedReferencePoint>][] = [
                [
                    "from table to treemap chart: date in rows only",
                    dateAsFirstCategoryReferencePoint,
                    {
                        buckets: [
                            dateAsFirstCategoryReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
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
                    "from table to treemap chart: two identical dates in rows",
                    twoIdenticalDatesInRowsWithSingleMeasure,
                    {
                        buckets: [
                            twoIdenticalDatesInRowsWithSingleMeasure.buckets[0],
                            {
                                localIdentifier: "view",
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
                    "from table to treemap chart: multiple dates in rows but not first (date does not have preference)",
                    multipleDatesNotAsFirstReferencePointWithSingleMeasure,
                    {
                        buckets: [
                            multipleDatesNotAsFirstReferencePointWithSingleMeasure.buckets[0],
                            {
                                localIdentifier: "view",
                                items: multipleDatesNotAsFirstReferencePointWithSingleMeasure.buckets[1].items.slice(
                                    0,
                                    1,
                                ),
                            },
                            {
                                localIdentifier: "segment",
                                items: multipleDatesNotAsFirstReferencePointWithSingleMeasure.buckets[1].items.slice(
                                    1,
                                    2,
                                ),
                            },
                        ],
                    },
                ],
                [
                    "from table to treemap chart: multiple dates in rows but not first, more measures",
                    multipleDatesNotAsFirstReferencePoint,
                    {
                        buckets: [
                            {
                                localIdentifier: "measures",
                                items: multipleDatesNotAsFirstReferencePoint.buckets[0].items.slice(0, 1),
                            },
                            {
                                localIdentifier: "view",
                                items: multipleDatesNotAsFirstReferencePoint.buckets[1].items.slice(0, 1),
                            },
                            {
                                localIdentifier: "segment",
                                items: multipleDatesNotAsFirstReferencePoint.buckets[1].items.slice(1, 2),
                            },
                        ],
                    },
                ],
                [
                    "from column to treemap chart: two dates",
                    twoDatesInColumnChart,
                    {
                        buckets: [
                            twoDatesInColumnChart.buckets[0],
                            {
                                localIdentifier: "view",
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
                    "from column to treemap chart: three dates",
                    threeDatesInColumnChart,
                    {
                        buckets: [
                            threeDatesInColumnChart.buckets[0],
                            {
                                localIdentifier: "view",
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
                    "from column to treemap chart: only stacks",
                    onlyStackColumnChart,
                    {
                        buckets: [
                            onlyStackColumnChart.buckets[0],
                            {
                                localIdentifier: "view",
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
                    const chart = createComponent();

                    const referencePoint = await chart.getExtendedReferencePoint(inputReferencePoint);
                    expect(referencePoint).toMatchObject(expectedReferencePoint);
                },
            );
        });
    });

    describe("PluggableTreemap renderVisualization and renderConfigurationPanel", () => {
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
