// (C) 2019 GoodData Corporation
import noop from "lodash/noop";
import get from "lodash/get";
import cloneDeep from "lodash/cloneDeep";
import * as referencePointMocks from "../../../tests/mocks/referencePointMocks";
import { IBucketOfFun, IFilters, IVisProps, IVisConstruct } from "../../../interfaces/Visualization";
import { MAX_VIEW_COUNT } from "../../../constants/uiConfig";
import * as uiConfigMocks from "../../../tests/mocks/uiConfigMocks";
import * as testMocks from "../../../tests/mocks/testMocks";
import {
    COLUMN_CHART_SUPPORTED_PROPERTIES,
    OPTIONAL_STACKING_PROPERTIES,
} from "../../../constants/supportedProperties";
import { AXIS } from "../../../constants/axis";
import { PluggableColumnChart } from "../columnChart/PluggableColumnChart";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { insightSetProperties, IInsight, IInsightDefinition, IAttribute } from "@gooddata/sdk-model";
import {
    insightDefinitionWithStackBy,
    targetUri,
    intersection,
    expectedInsightDefinitionWithStackByDrillToDepartment,
    expectedInsightDefinitionWithStackByDrillToRegion,
    insightDefinition,
    expectedInsightDefinitionDrillToRegion,
} from "./getInsightWithDrillDownAppliedMock";
import { IDrillEventIntersectionElement } from "@gooddata/sdk-ui";
import { createDrillEvent, createDrillDefinition, insightDefinitionToInsight } from "./testHelpers";
import { Department, Region } from "@gooddata/reference-workspace/dist/ldm/full";

describe("PluggableColumnBarCharts", () => {
    const defaultProps: IVisConstruct = {
        projectId: "PROJECTID",
        element: "body",
        configPanelElement: null as string,
        callbacks: {
            afterRender: noop,
            pushData: noop,
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: noop,
    };

    function createComponent(props = defaultProps) {
        return new PluggableColumnChart(props);
    }

    const executionFactory = dummyBackend({ hostname: "test", raiseNoDataExceptions: true })
        .workspace("PROJECTID")
        .execution();

    describe("optional stacking", () => {
        const options: IVisProps = {
            dimensions: { height: null },
            locale: "en-US",
            custom: {},
        };
        const emptyPropertiesMeta = {};

        it("should place third attribute to stack bucket", async () => {
            const columnChart = createComponent(defaultProps);
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
                    items: mockRefPoint.buckets[1].items.slice(MAX_VIEW_COUNT, MAX_VIEW_COUNT + 1),
                },
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: mockRefPoint.filters.items.slice(0, MAX_VIEW_COUNT + 1),
            };
            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                properties: {},
                uiConfig: uiConfigMocks.oneMetricAndOneStackColumnUiConfig,
            });
        });

        it("should reuse one measure, two categories and one category as stack", async () => {
            const columnChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.oneMetricAndManyCategoriesAndOneStackRefPoint;
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
                    items: mockRefPoint.buckets[2].items,
                },
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: mockRefPoint.filters.items,
            };
            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                properties: {},
                uiConfig: uiConfigMocks.oneMetricAndOneStackColumnUiConfig,
            });
        });

        it("should reuse all measures, two categories and no stack", async () => {
            const columnChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.multipleMetricsAndCategoriesReferencePoint;
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
            const expectedProperties = {
                controls: {
                    secondary_yaxis: {
                        measures: ["m3", "m4"],
                    },
                },
            };
            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                uiConfig: {
                    ...uiConfigMocks.multipleMetricsAndCategoriesColumnUiConfig,
                    axis: "dual",
                },
                properties: expectedProperties,
            });
        });

        it("should return reference point without Date in stacks", async () => {
            const columnChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.dateAsFirstCategoryReferencePoint;
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
                items: [],
            };
            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                properties: {},
                uiConfig: uiConfigMocks.oneMetricAndManyCategoriesColumnUiConfig,
            });
        });

        it("should cut out measures tail when getting many measures, no category and one stack", async () => {
            const columnChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.multipleMetricsOneStackByReferencePoint;
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items.slice(0, 1),
                },
                {
                    localIdentifier: "view",
                    items: [],
                },
                {
                    localIdentifier: "stack",
                    items: mockRefPoint.buckets[2].items,
                },
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: [],
            };
            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                uiConfig: uiConfigMocks.oneStackAndNoCategoryColumnUiConfig,
                properties: {},
            });
        });

        it("should update supported properties list base on axis type", async () => {
            const mockProps = {
                ...defaultProps,
                pushData: jest.fn(),
            };
            const chart = createComponent(mockProps);

            await chart.getExtendedReferencePoint(
                referencePointMocks.oneMetricAndCategoryAndStackReferencePoint,
            );
            expect(get(chart, "supportedPropertiesList")).toEqual(
                COLUMN_CHART_SUPPORTED_PROPERTIES[AXIS.PRIMARY].filter(
                    (props: string) => props !== OPTIONAL_STACKING_PROPERTIES[0],
                ),
            );

            await chart.getExtendedReferencePoint(
                referencePointMocks.measuresOnSecondaryAxisAndAttributeReferencePoint,
            );
            expect(get(chart, "supportedPropertiesList")).toEqual(
                COLUMN_CHART_SUPPORTED_PROPERTIES[AXIS.SECONDARY],
            );

            await chart.getExtendedReferencePoint(
                referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
            );
            expect(get(chart, "supportedPropertiesList")).toEqual(
                COLUMN_CHART_SUPPORTED_PROPERTIES[AXIS.DUAL],
            );
        });

        it("should disable open as report for insight have two view items", () => {
            const visualization = createComponent(defaultProps);
            visualization.update(
                options,
                testMocks.insightWithSingleMeasureAndTwoViewBy,
                emptyPropertiesMeta,
                executionFactory,
            );
            const isOpenAsReportSupported = visualization.isOpenAsReportSupported();
            expect(isOpenAsReportSupported).toBe(false);
        });

        it("should disable open as report for insight have properties stackMeasures ", () => {
            const visualization = createComponent(defaultProps);

            // stackMeasures property
            const visualizationProperties = {
                controls: {
                    stackMeasures: true,
                },
            };
            const testInsight = insightSetProperties(
                testMocks.insightWithTwoMeasuresAndViewBy,
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
                testMocks.insightWithTwoMeasuresAndViewBy,
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
                testMocks.insightWithTwoMeasuresAndViewBy,
                emptyPropertiesMeta,
                executionFactory,
            );
            const isOpenAsReportSupported = visualization.isOpenAsReportSupported();
            expect(isOpenAsReportSupported).toBe(true);
        });

        it("should retain stacking config after adding new measure", async () => {
            const columnChart = createComponent(defaultProps);

            // step1: init column chart with 1M, 1VB, 1SB with 'Stack to 100%' enabled
            const initialState =
                referencePointMocks.oneMeasuresOneCategoryOneStackItemWithStackMeasuresToPercent;
            let extendedReferencePoint = await columnChart.getExtendedReferencePoint(initialState);
            // 'Stack to 100%' checkbox is checked
            expect(extendedReferencePoint.properties.controls).toEqual({
                stackMeasuresToPercent: true,
            });

            // step2: remove StackBy item
            const stateWithStackByItemRemoved =
                referencePointMocks.oneMeasuresOneCategoryWithStackMeasuresToPercent;
            extendedReferencePoint = await columnChart.getExtendedReferencePoint(stateWithStackByItemRemoved);
            // 'Stack to 100%' and 'Stack Measures' checkboxes are hidden
            expect(extendedReferencePoint.properties.controls).toBeFalsy();

            // step3: add one more measure
            const stateWithNewMeasureAdded =
                referencePointMocks.twoMeasuresOneCategoryWithStackMeasuresToPercent;
            extendedReferencePoint = await columnChart.getExtendedReferencePoint(stateWithNewMeasureAdded);
            // column chart should be stacked in percent with 'Stack to 100%' and 'Stack Measures' checkboxes are checked
            expect(extendedReferencePoint.properties.controls).toEqual({
                stackMeasures: true,
                stackMeasuresToPercent: true,
            });
        });
    });

    describe("handling date items", () => {
        it("should keep only one date attribute in view by bucket when comming from stacked chart", async () => {
            const columnChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.dateAttributeOnViewAndStackReferencePoint;
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
            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        });

        it("should keep two date attributes in view by bucket when comming from pivot table with only one dimension", async () => {
            const columnChart = createComponent(defaultProps);
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
            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        });

        it("should keep only first date attribute in view by bucket when comming from pivot table with different dimensions", async () => {
            const columnChart = createComponent(defaultProps);
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
            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        });
    });

    describe("Drill Down", () => {
        it.each([
            [
                "on viewby when stacks present",
                insightDefinitionWithStackBy,
                Department,
                targetUri,
                intersection,
                expectedInsightDefinitionWithStackByDrillToDepartment,
            ],
            [
                "on stackby when stacks present",
                insightDefinitionWithStackBy,
                Region,
                targetUri,
                intersection,
                expectedInsightDefinitionWithStackByDrillToRegion,
            ],
            [
                "on viewby when stacks not present",
                insightDefinition,
                Region,
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

                const result: IInsight = columnChart.getInsightWithDrillDownApplied(sourceInsight, {
                    drillDefinition,
                    event: createDrillEvent("column", drillIntersection),
                });

                expect(result).toEqual(expectedInsight);
            },
        );
    });
});
