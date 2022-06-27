// (C) 2019-2022 GoodData Corporation
import noop from "lodash/noop";
import { PluggableTreemap } from "../PluggableTreemap";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";

import {
    IVisConstruct,
    IReferencePoint,
    IExtendedReferencePoint,
} from "../../../../interfaces/Visualization";
import { IDrillEventIntersectionElement } from "@gooddata/sdk-ui";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { Department, Region } from "@gooddata/reference-workspace/dist/md/full";
import { IInsight, IInsightDefinition, IAttribute } from "@gooddata/sdk-model";
import {
    createDrillEvent,
    insightDefinitionToInsight,
    createDrillDefinition,
    getLastRenderEl,
} from "../../tests/testHelpers";
import {
    sourceInsightDef,
    intersection,
    expectedInsightDefRegion,
    expectedInsightDefDepartment,
    targetUri,
} from "./getInsightWithDrillDownAppliedMock";
import * as testMocks from "../../../../tests/mocks/testMocks";

describe("PluggableTreemap", () => {
    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = jest.fn();
    const executionFactory = dummyBackend().workspace("PROJECTID").execution();
    const defaultProps: IVisConstruct = {
        projectId: "PROJECTID",
        element: () => mockElement,
        configPanelElement: () => mockConfigElement,
        callbacks: {
            afterRender: noop,
            pushData: noop,
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: mockRenderFun,
    };

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

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(
            referencePointMocks.simpleStackedReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return ref. point with 1 M, 1 Vb, 1 Sb and only valid filters for n M, n Vb, 0 Sb", async () => {
        const treemap = createComponent();

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return ref. point with 1 M, 1 Vb, 1 Sb and only valid filters for n M, n Attrs", async () => {
        const treemap = createComponent();

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(
            referencePointMocks.samePeriodPreviousYearAndAttributesRefPoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return ref. point with n M, 0 Vb, 0 Sb for n M, 0 Attr", async () => {
        const treemap = createComponent();

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with 1 M, 0 Vb, 0 Sb for 1 M, 0 Vb, 0 Sb", async () => {
        const treemap = createComponent();

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(
            referencePointMocks.oneMetricNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return ref. point with n M, 0 Vb, 1 Sb for n M, 0 Vb, 1 Sb", async () => {
        const treemap = createComponent();

        const extendedReferencePoint = await treemap.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsOneStackByReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
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

    describe("PluggableTreemap renderVisualization and renderConfigurationPanel", () => {
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
