// (C) 2019-2022 GoodData Corporation
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";

import {
    IBucketOfFun,
    IFilters,
    IVisProps,
    IVisConstruct,
    IReferencePoint,
    IExtendedReferencePoint,
} from "../../../../interfaces/Visualization";
import { PluggableAreaChart } from "../PluggableAreaChart";

import * as testMocks from "../../../../tests/mocks/testMocks";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import * as uiConfigMocks from "../../../../tests/mocks/uiConfigMocks";
import { MAX_VIEW_COUNT } from "../../../../constants/uiConfig";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IAttribute, IInsight, IInsightDefinition, insightSetProperties } from "@gooddata/sdk-model";
import { Department, Region } from "@gooddata/reference-workspace/dist/md/full";
import { IDrillEventIntersectionElement } from "@gooddata/sdk-ui";
import { createDrillDefinition, createDrillEvent, insightDefinitionToInsight } from "../../tests/testHelpers";
import {
    expectedInsightDefDepartment,
    expectedInsightDefRegion,
    intersection,
    sourceInsightDef,
    targetUri,
} from "./getInsightWithDrillDownAppliedMock";

describe("PluggableAreaChart", () => {
    const defaultProps: IVisConstruct = {
        projectId: "PROJECTID",
        element: "body",
        configPanelElement: null as string,
        callbacks: {
            afterRender: noop,
            pushData: noop,
            onError: noop,
            onLoadingChanged: noop,
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: noop,
    };

    const executionFactory = dummyBackend().workspace("PROJECTID").execution();

    function createComponent(props = defaultProps) {
        return new PluggableAreaChart(props);
    }

    afterAll(() => {
        document.clear();
    });

    it("should return reference point when no categories and only stacks", async () => {
        const areaChart = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.oneStackAndNoCategoriesReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "view",
                items: [],
            },
            {
                localIdentifier: "stack",
                items: referencePointMocks.oneStackAndNoCategoriesReferencePoint.buckets[2].items.slice(0, 1),
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };

        const extendedReferencePoint = await areaChart.getExtendedReferencePoint(
            referencePointMocks.oneStackAndNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: uiConfigMocks.oneStackAndNoCategoriesAreaUiConfig,
            properties: {},
        });
    });

    it("should cut out measures tail when getting nM 0Vb 1Sb", async () => {
        const baseChart = createComponent();
        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.multipleMetricsOneStackByReferencePoint.buckets[0].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "view",
                items: [],
            },
            {
                localIdentifier: "stack",
                items: referencePointMocks.multipleMetricsOneStackByReferencePoint.buckets[2].items,
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };
        const expectedProperties = {};

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsOneStackByReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: uiConfigMocks.oneMetricAndManyCategoriesAreaUiConfig,
            properties: expectedProperties,
        });
    });

    describe("handling date items", () => {
        describe("with multiple dates", () => {
            const inputs: [string, IReferencePoint, Partial<IExtendedReferencePoint>][] = [
                [
                    "from table to area chart: date1 and date2 in rows ans date1 columns",
                    referencePointMocks.twoDatesInRowsAndOneDateInColumnsReferencePoint,
                    {
                        buckets: [
                            referencePointMocks.twoDatesInRowsAndOneDateInColumnsReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: referencePointMocks.twoDatesInRowsAndOneDateInColumnsReferencePoint.buckets[1].items.slice(
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
                    referencePointMocks.tableTotalsReferencePoint,
                    {
                        buckets: [
                            referencePointMocks.tableTotalsReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: referencePointMocks.tableTotalsReferencePoint.buckets[1].items.slice(
                                    0,
                                    1,
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
                    "from table to area chart: date1 in rows ans date2 columns",
                    referencePointMocks.oneDateInRowsAndOneDateInColumnsReferencePoint,
                    {
                        buckets: [
                            referencePointMocks.oneDateInRowsAndOneDateInColumnsReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: [
                                    referencePointMocks.oneDateInRowsAndOneDateInColumnsReferencePoint
                                        .buckets[1].items[0],
                                    referencePointMocks.oneDateInRowsAndOneDateInColumnsReferencePoint
                                        .buckets[2].items[0],
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
                    referencePointMocks.oneDateInRowsAndSameOneDateInColumnsReferencePoint,
                    {
                        buckets: [
                            referencePointMocks.oneDateInRowsAndSameOneDateInColumnsReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: [
                                    referencePointMocks.oneDateInRowsAndSameOneDateInColumnsReferencePoint
                                        .buckets[1].items[0],
                                    referencePointMocks.oneDateInRowsAndSameOneDateInColumnsReferencePoint
                                        .buckets[2].items[0],
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
                    referencePointMocks.twoAttributesAndDateInRowsAndOneDateInColumnsReferencePoint,
                    {
                        buckets: [
                            referencePointMocks.twoAttributesAndDateInRowsAndOneDateInColumnsReferencePoint
                                .buckets[0],
                            {
                                localIdentifier: "view",
                                items: [
                                    referencePointMocks
                                        .twoAttributesAndDateInRowsAndOneDateInColumnsReferencePoint
                                        .buckets[1].items[0],
                                    referencePointMocks
                                        .twoAttributesAndDateInRowsAndOneDateInColumnsReferencePoint
                                        .buckets[1].items[1],
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
                    referencePointMocks.threeDatesInColumnsReferencePoint,
                    {
                        buckets: [
                            referencePointMocks.threeDatesInColumnsReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: [
                                    referencePointMocks.threeDatesInColumnsReferencePoint.buckets[2].items[0],
                                    referencePointMocks.threeDatesInColumnsReferencePoint.buckets[2].items[1],
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
                    referencePointMocks.dateInColumnsAndMultipleMeasuresTable,
                    {
                        buckets: [
                            referencePointMocks.dateInColumnsAndMultipleMeasuresTable.buckets[0],
                            {
                                localIdentifier: "view",
                                items: [
                                    referencePointMocks.dateInColumnsAndMultipleMeasuresTable.buckets[2]
                                        .items[0],
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
                    "from treemap to area chart: multiple measures and date in segment",
                    referencePointMocks.dateInColumnsAndMultipleMeasuresTreemap,
                    {
                        buckets: [
                            {
                                localIdentifier: "measures",
                                items: referencePointMocks.dateInColumnsAndMultipleMeasuresTreemap.buckets[0].items.slice(
                                    0,
                                    1,
                                ),
                            },
                            {
                                localIdentifier: "view",
                                items: [],
                            },
                            {
                                localIdentifier: "stack",
                                items: [
                                    referencePointMocks.dateInColumnsAndMultipleMeasuresTreemap.buckets[2]
                                        .items[0],
                                ],
                            },
                        ],
                    },
                ],
                [
                    "from colum chart to area chart: att1 and date1 in viewBy and date2 in stackBy",
                    referencePointMocks.attributeAndDateInViewByAndDateInStackByReferencePoint,
                    {
                        buckets: [
                            referencePointMocks.attributeAndDateInViewByAndDateInStackByReferencePoint
                                .buckets[0],
                            {
                                localIdentifier: "view",
                                items: [
                                    referencePointMocks.attributeAndDateInViewByAndDateInStackByReferencePoint
                                        .buckets[1].items[0],
                                ],
                            },
                            {
                                localIdentifier: "stack",
                                items: [
                                    referencePointMocks.attributeAndDateInViewByAndDateInStackByReferencePoint
                                        .buckets[2].items[0],
                                ],
                            },
                        ],
                    },
                ],
                [
                    "from colum chart to area chart: att1 and date1 in viewBy and empty stackBy",
                    referencePointMocks.dateAsSecondViewByItemReferencePoint,
                    {
                        buckets: [
                            referencePointMocks.dateAsSecondViewByItemReferencePoint.buckets[0],
                            {
                                localIdentifier: "view",
                                items: [
                                    referencePointMocks.dateAsSecondViewByItemReferencePoint.buckets[1]
                                        .items[0],
                                    referencePointMocks.dateAsSecondViewByItemReferencePoint.buckets[1]
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
                    "from colum chart to area chart: date1 and att1 in viewBy and empty stackBy",
                    referencePointMocks.dateAndAttributeInViewByAndEmptyStackBy,
                    {
                        buckets: [
                            referencePointMocks.dateAndAttributeInViewByAndEmptyStackBy.buckets[0],
                            {
                                localIdentifier: "view",
                                items: [
                                    referencePointMocks.dateAndAttributeInViewByAndEmptyStackBy.buckets[1]
                                        .items[0],
                                    referencePointMocks.dateAndAttributeInViewByAndEmptyStackBy.buckets[1]
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
                    "from colum chart to area chart: att1 and att2 in viewBy and att3 stackBy",
                    referencePointMocks.att1AndAtt2inViewByAndAtt3inStackBy,
                    {
                        buckets: [
                            referencePointMocks.att1AndAtt2inViewByAndAtt3inStackBy.buckets[0],
                            {
                                localIdentifier: "view",
                                items: [
                                    referencePointMocks.att1AndAtt2inViewByAndAtt3inStackBy.buckets[1]
                                        .items[0],
                                ],
                            },
                            {
                                localIdentifier: "stack",
                                items: [
                                    referencePointMocks.att1AndAtt2inViewByAndAtt3inStackBy.buckets[2]
                                        .items[0],
                                ],
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
                    const areaChart = createComponent({
                        ...defaultProps,
                        featureFlags: {
                            enableMultipleDates: true,
                        },
                    });

                    const referencePoint = await areaChart.getExtendedReferencePoint(inputReferencePoint);
                    expect(referencePoint).toMatchObject(expectedReferencePoint);
                },
            );
        });

        it("should allow only one date attribute when comming from stacked chart", async () => {
            const areaChart = createComponent();
            const referencePoint = referencePointMocks.dateAttributeOnViewAndStackReferencePoint;
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [referencePoint.buckets[0].items[0]],
                },
                {
                    localIdentifier: "view",
                    items: [referencePoint.buckets[1].items[0]],
                },
                {
                    localIdentifier: "stack",
                    items: [],
                },
            ];

            const extendedReferencePoint = await areaChart.getExtendedReferencePoint(
                referencePointMocks.dateAttributeOnViewAndStackReferencePoint,
            );

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        });

        it("should keep two date attributes in view by bucket when comming from pivot table with only one dimension", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.dateAttributeOnRowsAndColumnsReferencePoint;
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
            const mockRefPoint = cloneDeep(referencePointMocks.dateAttributesOnRowsReferencePoint);
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items,
                },
                {
                    localIdentifier: "view",
                    items: [mockRefPoint.buckets[1].items[0], mockRefPoint.buckets[1].items[3]],
                },
                {
                    localIdentifier: "stack",
                    items: [],
                },
            ];
            const extendedReferencePoint = await areaChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        });

        it("should keep only first date attribute in view by bucket when comming from pivot table with different dimensions", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = cloneDeep(referencePointMocks.dateAttributeOnRowsAndColumnsReferencePoint);
            mockRefPoint.buckets[2].items[0].dateDatasetRef = {
                uri: "closed",
            };
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items,
                },
                {
                    localIdentifier: "view",
                    items: [...mockRefPoint.buckets[1].items],
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
        };
        const emptyPropertiesMeta = {};

        const verifyStackMeasuresConfig = (
            chart: PluggableAreaChart,
            stackMeasures: boolean,
            spyOnRender: any,
        ) => {
            const visualizationProperties =
                stackMeasures !== null
                    ? {
                          controls: {
                              stackMeasures,
                          },
                      }
                    : {};
            const testInsight = insightSetProperties(
                testMocks.insightWithSingleMeasureAndViewBy,
                visualizationProperties,
            );
            const expected = stackMeasures === null ? true : stackMeasures;
            chart.update(options, testInsight, emptyPropertiesMeta, executionFactory);
            const renderCallsCount = spyOnRender.mock.calls.length;
            const renderArguments = spyOnRender.mock.calls[renderCallsCount - 1][0];
            expect(renderArguments.props.config.stackMeasures).toBe(expected);
        };

        it("should modify stack by default of area by config stackMeasures properties", async () => {
            const mockRenderFun = jest.fn();
            const areaChart = createComponent({ ...defaultProps, renderFun: mockRenderFun });

            verifyStackMeasuresConfig(areaChart, null, mockRenderFun);
            verifyStackMeasuresConfig(areaChart, true, mockRenderFun);
            verifyStackMeasuresConfig(areaChart, false, mockRenderFun);
        });

        it("should modify stackMeasures and stackMeasuresToPercent properties from true to false", async () => {
            const mockRenderFun = jest.fn();
            const areaChart = createComponent({ ...defaultProps, renderFun: mockRenderFun });

            const visualizationProperties = {
                properties: {
                    controls: {
                        stackMeasures: true,
                        stackMeasuresToPercent: true,
                    },
                },
            };

            const testInsight = insightSetProperties(
                testMocks.insightWithSingleMeasureAndTwoViewBy,
                visualizationProperties,
            );

            areaChart.update(options, testInsight, emptyPropertiesMeta, executionFactory);

            const renderCallsCount = mockRenderFun.mock.calls.length;
            const renderArguments: any = mockRenderFun.mock.calls[renderCallsCount - 1][0];
            expect(renderArguments.props.config.stackMeasures).toBe(false);
            expect(renderArguments.props.config.stackMeasuresToPercent).toBe(false);
        });

        it("should reset custom controls properties", async () => {
            const mockRenderFun = jest.fn();
            const areaChart = createComponent({ ...defaultProps, renderFun: mockRenderFun });

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
                testMocks.insightWithTwoMeasuresAndViewBy,
                visualizationProperties,
            );

            areaChart.update(options, testInsight, emptyPropertiesMeta, executionFactory);

            const renderCallsCount = mockRenderFun.mock.calls.length;
            const renderArguments: any = mockRenderFun.mock.calls[renderCallsCount - 1][0];
            expect(renderArguments.props.config.stackMeasures).toBe(true);
            expect(renderArguments.props.config.stackMeasuresToPercent).toBe(true);
        });

        it("should reuse one measure, only one category and one category as stack", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.oneMetricAndManyCategoriesAndOneStackRefPoint;

            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items,
                },
                {
                    localIdentifier: "view",
                    items: mockRefPoint.buckets[1].items.slice(0, 1),
                },
                {
                    localIdentifier: "stack",
                    items: mockRefPoint.buckets[2].items,
                },
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: [mockRefPoint.filters.items[0], mockRefPoint.filters.items[2]],
            };

            const extendedReferencePoint = await areaChart.getExtendedReferencePoint(mockRefPoint);
            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                uiConfig: uiConfigMocks.oneMetricAndOneCategoryAndOneStackAreaUiConfig,
                properties: {},
            });
        });

        it("should reuse one measure, two categories and no category as stack", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.oneMetricAndManyCategoriesReferencePoint;

            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items,
                },
                {
                    localIdentifier: "view",
                    items: mockRefPoint.buckets[1].items.slice(0, MAX_VIEW_COUNT),
                },
                {
                    localIdentifier: "stack",
                    items: [],
                },
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: mockRefPoint.filters.items.slice(0, MAX_VIEW_COUNT),
            };

            const extendedReferencePoint = await areaChart.getExtendedReferencePoint(mockRefPoint);
            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                uiConfig: uiConfigMocks.oneMetricManyCategoriesAreaUiConfig,
                properties: {},
            });
        });

        it("should reuse all measures, only one category and no stacks", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.multipleMetricsAndCategoriesReferencePoint;

            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items,
                },
                {
                    localIdentifier: "view",
                    items: mockRefPoint.buckets[1].items.slice(0, 1),
                },
                {
                    localIdentifier: "stack",
                    items: [],
                },
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: mockRefPoint.filters.items.slice(0, 1),
            };

            const extendedReferencePoint = await areaChart.getExtendedReferencePoint(mockRefPoint);
            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                uiConfig: uiConfigMocks.multipleMesuresAndCategoriesAreaUiConfig,
                properties: {},
            });
        });

        it("should return reference point with Date in categories even it was as third item", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.dateAsThirdCategoryReferencePointWithoutStack;
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items,
                },
                {
                    localIdentifier: "view",
                    items: [
                        ...mockRefPoint.buckets[1].items.slice(-1),
                        ...mockRefPoint.buckets[1].items.slice(0, 1),
                    ],
                },
                {
                    localIdentifier: "stack",
                    items: [],
                },
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: [],
            };

            const extendedReferencePoint = await areaChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                uiConfig: uiConfigMocks.dateAsThirdCategoryAreaUiConfig,
                properties: {},
            });
        });

        it("stackMeasures should be selected when select stackMeasuresToPercent", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.stackMeasuresToPercentReferencePoint;

            const extendedReferencePoint = await areaChart.getExtendedReferencePoint(mockRefPoint);
            expect(extendedReferencePoint.properties.controls).toEqual({
                stackMeasures: true,
                stackMeasuresToPercent: true,
            });
        });

        it("should keep date item as second view by item", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.dateAsSecondViewByItemReferencePoint;
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

        it("should move date from stack by bucket to view by bucket", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.dateAttributeOnStackBucketReferencePoint;
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items,
                },
                {
                    localIdentifier: "view",
                    items: mockRefPoint.buckets[2].items,
                },
                {
                    localIdentifier: "stack",
                    items: [],
                },
            ];

            const extendedReferencePoint = await areaChart.getExtendedReferencePoint(mockRefPoint);
            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        });

        it("should remove date from stack by bucket", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.dateAttributeOnViewAndStackReferencePoint;
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

        it("should not move attribute from view by to stack by", async () => {
            const areaChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.twoMeasuresAndDateAsSecondViewByItemReferencePoint;
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items,
                },
                {
                    localIdentifier: "view",
                    items: mockRefPoint.buckets[1].items.slice(1, 2),
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

            const extendedReferencePoint = await component.getExtendedReferencePoint(
                referencePointMocks.emptyReferencePoint,
            );

            expect(extendedReferencePoint.uiConfig.supportedOverTimeComparisonTypes).toEqual([]);
        });

        it("should remove all derived measures and arithmetic measures created from derived measures", async () => {
            const component = createComponent();

            const extendedReferencePoint = await component.getExtendedReferencePoint(
                referencePointMocks.mixOfMeasuresWithDerivedAndArithmeticFromDerivedAreaReferencePoint,
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

    describe("Sort config", () => {
        const scenarios: Array<[string, IReferencePoint]> = [
            ["0 M + 0 VB", referencePointMocks.emptyReferencePoint],
            ["1 M + 0 VB", referencePointMocks.oneMetricNoCategoriesReferencePoint],
            ["0 M + 1 VB", referencePointMocks.justViewByReferencePoint],
            ["1 M + 1 VB", referencePointMocks.oneMetricOneCategory],
            ["1 M + 2 VB", referencePointMocks.oneMetricAndTwoCategoriesReferencePoint],
            ["2 M + 1 VB", referencePointMocks.twoMetricAndOneCategoryRefPoint],
            ["2 M + 2 VB", referencePointMocks.twoMetricAndTwoCategoriesRefPoint],
            ["2 stacked M + 1 VB", referencePointMocks.twoStackedMetricAndOneCategoryRefPoint],
            ["2 stacked M + 2 VB", referencePointMocks.twoStackedMetricAndTwoCategoriesRefPoint],
            ["1 M + 1 VB + 1 ST", referencePointMocks.oneMetricAndOneCategoryAndOneStackRefPoint],
            ["2 M + 1 VB + 1 ST", referencePointMocks.twoMetricsAndOneCategoryAndOneStackRefPoint],
        ];

        it.each(scenarios)("should return expected sort config for %s", async (_name, referencePointMock) => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(referencePointMock);

            expect(sortConfig).toMatchSnapshot();
        });
    });
});
