// (C) 2019-2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    type IAttribute,
    type IInsight,
    type IInsightDefinition,
    insightSetProperties,
} from "@gooddata/sdk-model";
import {
    BucketNames,
    type IDrillEventIntersectionElement,
    type ILocale,
    type VisualizationEnvironment,
} from "@gooddata/sdk-ui";
import { type IBaseChartProps } from "@gooddata/sdk-ui-charts";

import {
    expectedInsightDefRegion,
    intersection,
    sourceInsightDef,
    targetUri,
} from "./getInsightWithDrillDownAppliedMock.js";
import { DASHBOARDS_ENVIRONMENT } from "../../../../constants/properties.js";
import {
    type IBucketOfFun,
    type IVisConstruct,
    type IVisProps,
} from "../../../../interfaces/Visualization.js";
import {
    dateAsFirstCategoryReferencePoint,
    dateAsSecondCategoryReferencePoint,
    derivedMeasureItems,
    emptyReferencePoint,
    masterMeasureItems,
    measureWithDateAfterOtherAttributes,
    measureWithDerivedAsFirstWithStackRefPoint,
    multipleAttributesReferencePoint,
    multipleMetricBucketsAndCategoryReferencePoint,
    multipleMetricsAndCategoriesReferencePoint,
    multipleMetricsNoCategoriesReferencePoint,
    multipleMetricsOneStackByReferencePoint,
    oneMeasureWithInvalidOverTimeComparisonRefPoint,
    oneMetricAndManyCategoriesReferencePoint,
    oneMetricAndManyCategoriesReferencePointWithInvalidSort,
    samePeriodPreviousYearAndAttributesRefPoint,
    simpleStackedReferencePoint,
    wrongBucketsOrderReferencePoint,
} from "../../../../tests/mocks/referencePointMocks.js";
import {
    emptyInsight,
    insightWithSingleAttribute,
    insightWithSingleMeasure,
    insightWithSingleMeasureAndStack,
    insightWithSingleMeasureAndViewBy,
    insightWithStacking,
} from "../../../../tests/mocks/testMocks.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../../utils/translations.js";
import { BaseChartConfigurationPanel } from "../../../configurationPanels/BaseChartConfigurationPanel.js";
import {
    createDrillDefinition,
    createDrillEvent,
    getLastRenderEl,
    insightDefinitionToInsight,
} from "../../tests/pluggableVisualizations.test.helpers.js";
import { PluggableBaseChart } from "../PluggableBaseChart.js";

const { Region } = ReferenceMd;

function noop() {}

describe("PluggableBaseChart", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    const noneEnvironment: VisualizationEnvironment = "none";
    const dummyLocale: ILocale = "en-US";
    const backend = dummyBackend();
    const executionFactory = backend.workspace("PROJECTID").execution();
    const emptyPropertiesMeta = {};
    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();

    const callbacks: any = {
        afterRender: () => {},
        pushData: () => {},
        onError: null,
        onLoadingChanged: null,
    };

    const defaultProps: IVisConstruct = {
        projectId: "PROJECTID",
        element: () => mockElement,
        configPanelElement: () => mockConfigElement,
        backend: dummyBackend(),
        visualizationProperties: {},
        callbacks,
        renderFun: mockRenderFun,
        messages: DEFAULT_MESSAGES[DEFAULT_LANGUAGE],
    } as unknown as IVisConstruct;

    function createComponent(props = defaultProps) {
        return new PluggableBaseChart(props);
    }

    function dummyConfigurationRenderer(insight: IInsightDefinition) {
        const properties = {};

        return (
            <BaseChartConfigurationPanel
                locale={DEFAULT_LANGUAGE}
                properties={properties}
                propertiesMeta={null}
                insight={insight}
                pushData={noop} // if this is inline, the deep comparison fails later on
                type="column"
                featureFlags={{}}
                panelConfig={{}}
            />
        );
    }

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    it("should create visualization", () => {
        const visualization = createComponent();
        expect(visualization).toBeTruthy();
    });

    it("should not render chart when insight has no data to render", () => {
        const onError = vi.fn();
        const props = {
            ...defaultProps,
            callbacks: {
                ...callbacks,
                onError,
            },
        };

        const visualization = createComponent(props);
        const options: IVisProps = {
            dimensions: { height: undefined },
            locale: dummyLocale,
            custom: {},
            messages,
        };

        visualization.update(options, emptyInsight, emptyPropertiesMeta, executionFactory);

        const renderEl = getLastRenderEl(mockRenderFun, mockElement);

        expect(renderEl).toBeUndefined();
        expect(onError).toHaveBeenCalled();
    });

    it("should not render chart when insight has no measure", () => {
        const onError = vi.fn();
        const props = {
            ...defaultProps,
            callbacks: {
                ...callbacks,
                onError,
            },
        };

        const visualization = createComponent(props);
        const options: IVisProps = {
            dimensions: { height: undefined },
            locale: dummyLocale,
            custom: {},
            messages,
        };

        visualization.update(options, insightWithSingleAttribute, emptyPropertiesMeta, executionFactory);

        const renderEl = getLastRenderEl(mockRenderFun, mockElement);

        expect(renderEl).toBeUndefined();
        expect(onError).toHaveBeenCalled();
    });

    it("should render chart with legend on right when it is auto positioned and visualization is stacked", () => {
        const expectedHeight = 5;

        const visualization = createComponent();
        const options: IVisProps = {
            dimensions: { height: expectedHeight },
            locale: dummyLocale,
            custom: {},
            messages,
        };

        const visualizationProperties = {
            controls: {
                legend: {
                    position: "auto",
                },
            },
        };

        const testInsight = insightSetProperties(insightWithStacking, visualizationProperties);

        visualization.update(options, testInsight, emptyPropertiesMeta, executionFactory);

        const renderEl = getLastRenderEl<IBaseChartProps>(mockRenderFun, mockElement);
        expect(renderEl).toBeDefined();

        expect(renderEl!.props.config!.legend!.position).toEqual("right");
    });

    it("should render configuration panel with correct properties", () => {
        const expectedHeight = 5;

        const visualization = createComponent();
        const options: IVisProps = {
            dimensions: { height: expectedHeight },
            locale: dummyLocale,
            custom: {},
            messages,
        };

        visualization.update(options, insightWithSingleMeasureAndViewBy, null, executionFactory);
        const expectedConfigPanelElement = dummyConfigurationRenderer(insightWithSingleMeasureAndViewBy);

        // arguments of last called render method
        const renderEl = getLastRenderEl<IVisProps>(mockRenderFun, mockConfigElement);
        expect(renderEl).toBeDefined();

        // compare without intl and pushData, filtering out undefined values and nested undefined values for React 19 compatibility
        const actualProps = {
            ...renderEl!.props,
            pushData: noop, // cannot be inline otherwise comparison fails, see above comment
        };

        // Helper function to remove undefined values recursively
        const removeUndefined = (obj: any): any => {
            if (obj === null || typeof obj !== "object") {
                return obj;
            }

            if (Array.isArray(obj)) {
                return obj.map(removeUndefined);
            }

            const result: any = {};
            for (const [key, value] of Object.entries(obj)) {
                if (value !== undefined) {
                    const cleanValue = removeUndefined(value);
                    if (cleanValue !== undefined) {
                        result[key] = cleanValue;
                    }
                }
            }
            return result;
        };

        const filteredActualProps = removeUndefined(actualProps);
        expect(filteredActualProps).toEqual(expectedConfigPanelElement.props);
    });

    it("should render chart with undefined height", () => {
        const props = { ...defaultProps, environment: noneEnvironment };

        const visualization = createComponent(props);
        const options: IVisProps = {
            dimensions: { height: 50 },
            locale: dummyLocale,
            custom: {},
            messages,
        };

        const visualizationProperties = { controls: { legend: {} } };
        const testInsight = insightSetProperties(insightWithSingleMeasureAndViewBy, visualizationProperties);

        visualization.update(options, testInsight, emptyPropertiesMeta, executionFactory);

        const renderEl = getLastRenderEl<IBaseChartProps>(mockRenderFun, mockElement);
        expect(renderEl).toBeDefined();

        expect(renderEl!.props.height).toBeUndefined();
    });

    it(
        "should return reference point with base recommendations enabled " +
            "if visualization removed invalid derived measure",
        async () => {
            const baseChart = createComponent();

            const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
                oneMeasureWithInvalidOverTimeComparisonRefPoint,
            );

            expect(extendedReferencePoint).toMatchSnapshot();
        },
    );

    it("should return ref. point with multiple metrics and one category and filter for this category", async () => {
        const baseChart = createComponent();

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with one metric and date and attribute", async () => {
        const baseChart = createComponent();

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            dateAsFirstCategoryReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with one metric and only one category and stack", async () => {
        const baseChart = createComponent();

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(simpleStackedReferencePoint);

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it(
        'should remove derived measure and place first attribute to "trend" and second attribute to "stack"' +
            "when single measure with comparison is applied and date is first attribute",
        async () => {
            const baseChart = createComponent();

            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [samePeriodPreviousYearAndAttributesRefPoint.buckets[0].items[0]],
                },
                {
                    localIdentifier: "view",
                    items: [samePeriodPreviousYearAndAttributesRefPoint.buckets[1].items[0]],
                },
                {
                    localIdentifier: "stack",
                    items: [samePeriodPreviousYearAndAttributesRefPoint.buckets[1].items[1]],
                },
            ];

            const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
                samePeriodPreviousYearAndAttributesRefPoint,
            );

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        },
    );

    it(
        'should remove derived measure and place first attribute to "trend" and second attribute to "stack"' +
            "when single measure with comparison is applied and date not first or second attribute",
        async () => {
            const baseChart = createComponent();
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [measureWithDateAfterOtherAttributes.buckets[0].items[0]],
                },
                {
                    localIdentifier: "view",
                    items: [measureWithDateAfterOtherAttributes.buckets[1].items[0]],
                },
                {
                    localIdentifier: "stack",
                    items: [measureWithDateAfterOtherAttributes.buckets[1].items[1]],
                },
            ];

            const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
                measureWithDateAfterOtherAttributes,
            );

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        },
    );

    it("should return reference point with multiple metrics from multiple metrics buckets", async () => {
        const baseChart = createComponent();

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            multipleMetricBucketsAndCategoryReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with one metric, one category, second category as stack, valid filters", async () => {
        const baseChart = createComponent();

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            oneMetricAndManyCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point without Date in stacks", async () => {
        const baseChart = createComponent();

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            dateAsSecondCategoryReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should handle wrong order of buckets in reference point", async () => {
        const baseChart = createComponent();

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            wrongBucketsOrderReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should use second non-date attribute when switching to chart with [attribute, date, attribute]", async () => {
        const baseChart = createComponent();

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            multipleAttributesReferencePoint,
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

    it("should remove invalid sorts from reference point", async () => {
        const baseChart = createComponent();

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            oneMetricAndManyCategoriesReferencePointWithInvalidSort,
        );
        expect(extendedReferencePoint.properties).toEqual({
            sortItems: [
                {
                    attributeSortItem: {
                        attributeIdentifier: "unknown",
                        direction: "asc",
                    },
                },
            ],
        });
    });

    it("should not return derived measures when stack-by is there", async () => {
        const baseChart = createComponent();
        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            measureWithDerivedAsFirstWithStackRefPoint,
        );

        const measures = extendedReferencePoint.buckets[0].items;

        expect(measures).toEqual(masterMeasureItems.slice(0, 1));
    });

    describe("Over Time Comparison", () => {
        it("should place new derived bucket items to right place in referencePoint buckets", async () => {
            const baseChart = createComponent();

            const referencePointWithDerivedItems = await baseChart.addNewDerivedBucketItems(
                multipleMetricsNoCategoriesReferencePoint,
                [derivedMeasureItems[0], derivedMeasureItems[1]],
            );

            expect(referencePointWithDerivedItems).toEqual({
                ...multipleMetricsNoCategoriesReferencePoint,
                ...{
                    buckets: [
                        {
                            localIdentifier: BucketNames.MEASURES,
                            items: [
                                derivedMeasureItems[0],
                                masterMeasureItems[0],
                                derivedMeasureItems[1],
                                masterMeasureItems[1],
                                masterMeasureItems[2],
                                masterMeasureItems[3],
                            ],
                        },
                        multipleMetricsNoCategoriesReferencePoint.buckets[1],
                        multipleMetricsNoCategoriesReferencePoint.buckets[2],
                    ],
                },
            });
        });

        it("should return reference point containing uiConfig with no supported comparison types", async () => {
            const component = createComponent();

            const extendedReferencePoint = await component.getExtendedReferencePoint(emptyReferencePoint);

            expect(extendedReferencePoint.uiConfig!.supportedOverTimeComparisonTypes).toEqual([]);
        });
    });

    describe("legend position", () => {
        it.each([
            ["auto", 1000, "auto"],
            ["right", 1000, "right"],
            ["auto", 600, "top"],
            ["right", 600, "right"],
            ["auto", 400, "top"],
            ["right", 400, "top"],
        ])(
            "should set legend position to %s when width is %s",
            (desiredPosition: string, width: number, expectedPosition: string) => {
                const props = {
                    ...defaultProps,
                    environment: DASHBOARDS_ENVIRONMENT as VisualizationEnvironment,
                };

                const visualization = createComponent(props);
                const options: IVisProps = {
                    dimensions: { height: 5, width },
                    locale: dummyLocale,
                    custom: {},
                    messages,
                };

                const visualizationProperties = {
                    controls: {
                        legend: {
                            position: desiredPosition,
                        },
                    },
                };
                const insightWithProperties = insightSetProperties(
                    insightWithSingleMeasureAndStack,
                    visualizationProperties,
                );
                visualization.update(options, insightWithProperties, {}, executionFactory);

                const renderEl = getLastRenderEl(mockRenderFun, mockElement);

                expect(renderEl).toBeDefined();
                expect(renderEl!.props.config!.legend!.position).toEqual(expectedPosition);
            },
        );
    });

    describe("Drill Down", () => {
        it.each([
            [
                "on viewby attribute",
                sourceInsightDef,
                Region.Default,
                targetUri,
                intersection,
                expectedInsightDefRegion,
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
                const bulletChart = createComponent();
                const drillDefinition = createDrillDefinition(drillSourceAttribute, drillTargetUri);
                const sourceInsight = insightDefinitionToInsight(sourceInsightDefinition, "first", "first");
                const expectedInsight = insightDefinitionToInsight(
                    expectedInsightDefinition,
                    "first",
                    "first",
                );

                const result: IInsight = bulletChart.getInsightWithDrillDownApplied(
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
