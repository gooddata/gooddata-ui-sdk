// (C) 2019 GoodData Corporation
import noop = require("lodash/noop");

import { IBucketOfFun, IFilters, IVisProps } from "../../../../interfaces/Visualization";
import { PluggableAreaChart } from "../PluggableAreaChart";

import * as testMocks from "../../../../tests/mocks/testMocks";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import * as uiConfigMocks from "../../../../tests/mocks/uiConfigMocks";
import { MAX_VIEW_COUNT } from "../../../../constants/uiConfig";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { insightSetProperties } from "@gooddata/sdk-model";

describe("PluggableAreaChart", () => {
    const defaultProps = {
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

    it("should allow only one date attribute", async () => {
        const areaChart = createComponent();
        const referencePoint = referencePointMocks.dateAttributeOnRowAndColumnReferencePoint;
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
            referencePointMocks.dateAttributeOnRowAndColumnReferencePoint,
        );

        expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
    });

    describe("optional stacking", () => {
        const options: IVisProps = {
            dimensions: { height: 5 },
            locale: "en-US",
            custom: {},
        };

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
            chart.update(options, testInsight, executionFactory);
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

            areaChart.update(options, testInsight, executionFactory);

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

            areaChart.update(options, testInsight, executionFactory);

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
            const mockRefPoint = referencePointMocks.dateAttributeOnRowAndColumnReferencePoint;
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
});
