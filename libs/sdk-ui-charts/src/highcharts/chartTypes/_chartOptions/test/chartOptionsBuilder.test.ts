// (C) 2007-2022 GoodData Corporation
import range from "lodash/range";
import set from "lodash/set";
import isNil from "lodash/isNil";
import cloneDeep from "lodash/cloneDeep";
import findIndex from "lodash/findIndex";
import { DefaultColorPalette, VisualizationTypes, HeaderPredicates, DataViewFacade } from "@gooddata/sdk-ui";
import Highcharts from "../../../lib";
import { findMeasureGroupInDimensions } from "../../_util/executionResultHelper";
import { getHeatmapDataClasses, getTreemapAttributes } from "../chartOptionsBuilder";
import { DEFAULT_CATEGORIES_LIMIT } from "../../_chartCreators/commonConfiguration";
import { generateChartOptions, getMVS, getMVSForViewByTwoAttributes } from "../../_util/test/helper";
import * as fixtures from "../../../../../__mocks__/fixtures";
import { PIE_CHART_LIMIT } from "../../../constants/limits";
import {
    getLighterColor,
    getRgbString,
    IColorStrategy,
    AttributeColorStrategy,
} from "@gooddata/sdk-ui-vis-commons";

import { IChartConfig } from "../../../../interfaces";
import { emptyDef, IColorPaletteItem, idRef } from "@gooddata/sdk-model";
import { customEscape } from "../../_util/common";
import { StackingType } from "../../../constants/stacking";
import { IChartOptions, IUnsafeHighchartsTooltipPoint } from "../../../typings/unsafe";
import { MeasureColorStrategy } from "../../_chartColoring/measure";
import { HeatmapColorStrategy } from "../../heatmap/heatmapColoring";
import { TreemapColorStrategy } from "../../treemap/treemapColoring";
import { BubbleChartColorStrategy } from "../../bubbleChart/bubbleChartColoring";
import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import { GRAY, TRANSPARENT } from "../../_util/color";
import { getHeatmapSeries } from "../../heatmap/heatmapChartSeries";
import { isNegativeValueIncluded, IValidationResult, validateData } from "../chartLimits";
import { getSeries, getSeriesItemData } from "../chartSeries";
import {
    buildTooltipFactory,
    buildTooltipForTwoAttributesFactory,
    buildTooltipTreemapFactory,
    generateTooltipHeatmapFn,
    generateTooltipXYFn,
} from "../chartTooltips";
import { getDrillableSeries } from "../chartDrilling";
import { IUnwrappedAttributeHeadersWithItems } from "../../../typings/mess";
import { IMeasureDescriptor } from "@gooddata/sdk-backend-spi";

const FIRST_DEFAULT_COLOR_ITEM_AS_STRING = getRgbString(DefaultColorPalette[0]);
const SECOND_DEFAULT_COLOR_ITEM_AS_STRING = getRgbString(DefaultColorPalette[1]);

function getMVSTreemap(dv: DataViewFacade) {
    const dimensions = dv.meta().dimensions();
    const measureGroup = findMeasureGroupInDimensions(dimensions);
    const { viewByAttribute, stackByAttribute } = getTreemapAttributes(dv);

    return {
        measureGroup,
        viewByAttribute,
        stackByAttribute,
    };
}

function getSeriesItemDataParameters(dv: DataViewFacade, seriesIndex: any) {
    const seriesItem = dv.rawData().dataAt(seriesIndex);
    const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dv);
    return [seriesItem, seriesIndex, measureGroup, viewByAttribute, stackByAttribute];
}

const emptyDataView = DataViewFacade.for(dummyDataView(emptyDef("testWorkspace")));

describe("chartOptionsBuilder", () => {
    const DEFAULT_TOOLTIP_CONTENT_WIDTH = 320;
    const SMALL_TOOLTIP_CONTENT_WIDTH = 200;
    const { COLUMN, LINE, COMBO } = VisualizationTypes;

    const barChartWithStackByAndViewByAttributesOptions = generateChartOptions();

    const barChartWith3MetricsAndViewByAttributeOptions = generateChartOptions(
        fixtures.barChartWith3MetricsAndViewByAttribute,
    );

    function getValues(str: string): string[] {
        const strWithoutHiddenSpan = str.replace(/<span[^><]+max-content[^<>]+>[^<]+<\/span>/g, "");
        const test = />([^<]+)<\/span>/g;
        const result = strWithoutHiddenSpan.match(test).map((match: string) => match.slice(1, -7));
        return (result && result.length) >= 2 ? result : null;
    }

    function getStyleMaxWidth(str: string): string[] {
        const strWithoutHiddenSpan = str.replace(/<span[^><]+max-content[^<>]+>[^<]+<\/span>/g, "");
        const testRegex = /max-width: ([^;:]+)px;/g;
        return strWithoutHiddenSpan.match(testRegex).map((match: string): string => match.slice(11, -3));
    }

    // fun dataset with negative values: [["-1", "38310753.45", "9011389.956"]]
    const pieAndTreemapFunDataset = fixtures.pieChartWithMetricsOnlyFundata;

    const pieChartOptionsWithNegativeValue = generateChartOptions(pieAndTreemapFunDataset, { type: "pie" });

    const treemapOptionsWithNegativeValue = generateChartOptions(pieAndTreemapFunDataset, {
        type: "treemap",
    });

    const pieChartWithMetricsOnlyOptions: any = generateChartOptions(fixtures.pieChartWithMetricsOnly, {
        type: "pie",
    });

    const pointForSmallCharts = {
        node: {
            isLeaf: true,
        },
        value: 300,
        x: 0,
        y: 0,
        series: {
            chart: {
                plotWidth: 200,
            },
            name: "name",
            userOptions: {
                dataLabels: {
                    formatGD: "abcd",
                },
            },
        },
    };

    describe("isNegativeValueIncluded", () => {
        it("should return true if there is at least one negative value in series", () => {
            expect(isNegativeValueIncluded(pieChartOptionsWithNegativeValue.data.series)).toBe(true);
        });
        it("should return false if there are no negative values in series", () => {
            expect(isNegativeValueIncluded(pieChartWithMetricsOnlyOptions.data.series)).toBe(false);
        });
    });

    describe("validateData", () => {
        describe("user supplied limits", () => {
            it('should validate with "dataTooLarge: true" against series limit', () => {
                const validationResult = validateData(
                    {
                        series: 1,
                    },
                    barChartWith3MetricsAndViewByAttributeOptions,
                );

                expect(validationResult).toEqual({
                    dataTooLarge: true,
                    hasNegativeValue: false,
                });
            });
            it('should validate with "dataTooLarge: true" against categories limit', () => {
                const validationResult = validateData(
                    {
                        categories: 1,
                    },
                    barChartWith3MetricsAndViewByAttributeOptions,
                );

                expect(validationResult).toEqual({
                    dataTooLarge: true,
                    hasNegativeValue: false,
                });
            });
        });

        describe("default limits", () => {
            it("should be able to validate successfully", () => {
                const chartOptions = barChartWithStackByAndViewByAttributesOptions;
                const validationResult = validateData(undefined, chartOptions);

                expect(validationResult).toEqual({
                    dataTooLarge: false,
                    hasNegativeValue: false,
                });
            });
            it(
                'should validate with "dataTooLarge: true" against default chart categories limit ' +
                    `of ${DEFAULT_CATEGORIES_LIMIT}`,
                () => {
                    const chartOptions = generateChartOptions(
                        fixtures.barChartWith3MetricsAndViewByAttribute,
                    );
                    chartOptions.data.categories = range(DEFAULT_CATEGORIES_LIMIT + 1).map((category) => [
                        category.toString(),
                    ]);

                    const validationResult = validateData(undefined, chartOptions);

                    expect(validationResult).toEqual({
                        dataTooLarge: true,
                        hasNegativeValue: false,
                    });
                },
            );

            it('should validate with "dataTooLarge: true" against default pie chart series limit of 1', () => {
                const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute, {
                    type: "pie",
                });
                const validationResult = validateData(undefined, chartOptions);

                expect(validationResult).toEqual({
                    dataTooLarge: true,
                    hasNegativeValue: false,
                });
            });

            it(
                'should validate with "dataTooLarge: true" against default' +
                    `pie chart categories limit of ${PIE_CHART_LIMIT}`,
                () => {
                    const chartOptions = generateChartOptions(fixtures.pieChartWithMetricsOnly, {
                        type: "pie",
                    });
                    chartOptions.data.categories = range(PIE_CHART_LIMIT + 1).map((category) => [
                        category.toString(),
                    ]);
                    const validationResult = validateData(undefined, chartOptions);

                    expect(validationResult).toEqual({
                        dataTooLarge: true,
                        hasNegativeValue: false,
                    });
                },
            );
            it('should validate with "hasNegativeValue: true" for pie chart if its series contains a negative value', () => {
                const chartOptions = pieChartOptionsWithNegativeValue;
                const validationResult = validateData(undefined, chartOptions);

                expect(validationResult).toEqual({
                    dataTooLarge: false,
                    hasNegativeValue: true,
                });
            });
            it('should validate with "hasNegativeValue: true" for treemap if its series contains a negative value', () => {
                const validationResult = validateData(undefined, treemapOptionsWithNegativeValue);
                expect(validationResult).toEqual({
                    dataTooLarge: false,
                    hasNegativeValue: true,
                });
            });
        });

        describe("Treemap filters out root nodes for dataPoints limit", () => {
            it('should validate with "dataTooLarge: false" against data points limit', () => {
                // 2 roots + 4 leafs
                const treemapOptions = generateChartOptions(
                    fixtures.treemapWithMetricViewByAndStackByAttribute,
                    {
                        type: "treemap",
                    },
                );
                const validationResult = validateData(
                    {
                        dataPoints: 4,
                    },
                    treemapOptions,
                );

                expect(validationResult).toEqual({
                    dataTooLarge: false,
                    hasNegativeValue: false,
                });
            });

            it('should validate with "dataTooLarge: true" against data points limit', () => {
                // 2 roots + 4 leafs
                const treemapOptions = generateChartOptions(
                    fixtures.treemapWithMetricViewByAndStackByAttribute,
                    {
                        type: "treemap",
                    },
                );
                const validationResult = validateData(
                    {
                        dataPoints: 3,
                    },
                    treemapOptions,
                );

                expect(validationResult).toEqual({
                    dataTooLarge: true,
                    hasNegativeValue: false,
                });
            });
        });

        describe("optional stacking with viewBy 2 attributes", () => {
            const chartOptions: IChartOptions = {
                isViewByTwoAttributes: true,
                type: "column",
            };

            const testData = [
                ["false", "less", 3, { dataTooLarge: false, hasNegativeValue: false }],
                ["true", "greater", 31, { dataTooLarge: true, hasNegativeValue: false }],
            ];

            it.each(testData)(
                'should validate with "dataTooLarge: %s" when category number is %s than default limit',
                (_result: string, _operator: string, categoriesNum: number, expected: IValidationResult) => {
                    const data = {
                        series: Array(1),
                        categories: Array(categoriesNum).fill({
                            name: "Month",
                            categories: Array(31),
                        }),
                    };
                    const validationResult = validateData(undefined, { ...chartOptions, data });
                    expect(validationResult).toEqual(expected);
                },
            );
        });
    });

    describe("getSeriesItemData", () => {
        describe("in usecase of bar chart with pop measure and view by attribute", () => {
            const dv = fixtures.barChartWithPopMeasureAndViewByAttribute;
            const parameters = getSeriesItemDataParameters(dv, 0);
            const seriesItem = parameters[0];
            const seriesIndex = parameters[1];
            const measureGroup = parameters[2];
            const viewByAttribute = parameters[3];
            const stackByAttribute = parameters[4];

            const attributeColorStrategy = new AttributeColorStrategy(
                DefaultColorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
            );

            const seriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                "column",
                attributeColorStrategy,
            );

            it("should fill correct pointData name", () => {
                expect(seriesItemData.map((pointData: any) => pointData.name)).toEqual([
                    "Amount previous year",
                    "Amount previous year",
                    "Amount previous year",
                    "Amount previous year",
                    "Amount previous year",
                    "Amount previous year",
                ]);
            });

            it("should parse all pointData values", () => {
                expect(seriesItemData.map((pointData: any) => pointData.y)).toEqual([
                    null,
                    2773426.95,
                    8656468.2,
                    29140409.09,
                    60270072.2,
                    15785080.1,
                ]);
            });

            it("should disable markers for all null pointData values", () => {
                expect(seriesItemData.map((pointData: any) => pointData.marker?.enabled)).toEqual([
                    false,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                ]);
            });
        });

        describe("in usecase of bar chart with previous period measure and view by attribute", () => {
            const dv = fixtures.barChartWithPreviousPeriodMeasure;
            const parameters = getSeriesItemDataParameters(dv, 0);
            const seriesItem = parameters[0];
            const seriesIndex = parameters[1];
            const measureGroup = parameters[2];
            const viewByAttribute = parameters[3];
            const stackByAttribute = parameters[4];

            const attributeColorStrategy = new AttributeColorStrategy(
                DefaultColorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
            );

            const seriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                "column",
                attributeColorStrategy,
            );

            it("should fill correct pointData name", () => {
                expect(seriesItemData.map((pointData: any) => pointData.name)).toEqual([
                    "Primary measure - period ago",
                    "Primary measure - period ago",
                ]);
            });

            it("should parse all pointData values", () => {
                expect(seriesItemData.map((pointData: any) => pointData.y)).toEqual([24000, null]);
            });

            it("should disable markers for all null pointData values", () => {
                expect(seriesItemData.map((pointData: any) => pointData.marker?.enabled)).toEqual([
                    undefined,
                    false,
                ]);
            });
        });

        describe("in usecase of pie chart and treemap with metrics only", () => {
            const dv = fixtures.pieChartWithMetricsOnly;
            const parameters = getSeriesItemDataParameters(dv, 0);
            const seriesItem = parameters[0];
            const seriesIndex = parameters[1];
            const measureGroup = parameters[2];
            const viewByAttribute = parameters[3];
            const stackByAttribute = parameters[4];

            const metricColorStrategy = new MeasureColorStrategy(
                DefaultColorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
            );

            const pieSeriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                "pie",
                metricColorStrategy,
            );

            const treeMapColorStrategy = new TreemapColorStrategy(
                DefaultColorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
            );

            const treemapSeriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                "treemap",
                treeMapColorStrategy,
            );

            it("should fill correct pointData name", () => {
                expect(pieSeriesItemData.map((pointData) => pointData.name)).toEqual([
                    "Lost",
                    "Won",
                    "Expected",
                ]);

                expect(treemapSeriesItemData.map((pointData) => pointData.name)).toEqual([
                    "Lost",
                    "Won",
                    "Expected",
                ]);
            });

            it("should fill correct pointData color", () => {
                expect(pieSeriesItemData.map((pointData) => pointData.color)).toEqual([
                    FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                    SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                    getRgbString(DefaultColorPalette[2]),
                ]);

                expect(treemapSeriesItemData.map((pointData) => pointData.color)).toEqual([
                    FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                    SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                    getRgbString(DefaultColorPalette[2]),
                ]);
            });

            it("should fill correct pointData legendIndex", () => {
                expect(pieSeriesItemData.map((pointData) => pointData.legendIndex)).toEqual([0, 1, 2]);

                expect(treemapSeriesItemData.map((pointData) => pointData.legendIndex)).toEqual([0, 1, 2]);
            });

            it("should fill correct pointData format", () => {
                expect(pieSeriesItemData.map((pointData) => pointData.format)).toEqual([
                    "#,##0.00",
                    "#,##0.00",
                    "#,##0.00",
                ]);

                expect(treemapSeriesItemData.map((pointData) => pointData.format)).toEqual([
                    "#,##0.00",
                    "#,##0.00",
                    "#,##0.00",
                ]);
            });
        });

        describe("in usecase of pie chart with an attribute", () => {
            const dv = fixtures.barChartWithViewByAttribute;
            const parameters = getSeriesItemDataParameters(dv, 0);
            const seriesItem = parameters[0];
            const seriesIndex = parameters[1];
            const measureGroup = parameters[2];
            const viewByAttribute = parameters[3];
            const stackByAttribute = parameters[4];

            const attributeColorStrategy = new AttributeColorStrategy(
                DefaultColorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
            );

            const pieSeriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                "pie",
                attributeColorStrategy,
            );

            const treeMapColorStrategy = new TreemapColorStrategy(
                DefaultColorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
            );

            const treemapSeriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                "treemap",
                treeMapColorStrategy,
            );

            it("should fill correct pointData name", () => {
                expect(pieSeriesItemData.map((pointData) => pointData.name)).toEqual([
                    "Direct Sales",
                    "Inside Sales",
                ]);

                expect(treemapSeriesItemData.map((pointData) => pointData.name)).toEqual([
                    "Direct Sales",
                    "Inside Sales",
                ]);
            });

            it("should fill correct pointData color", () => {
                expect(pieSeriesItemData.map((pointData) => pointData.color)).toEqual([
                    FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                    SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                ]);

                expect(treemapSeriesItemData.map((pointData) => pointData.color)).toEqual([
                    FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                    SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                ]);
            });

            it("should fill correct pointData legendIndex", () => {
                expect(pieSeriesItemData.map((pointData) => pointData.legendIndex)).toEqual([0, 1]);

                expect(treemapSeriesItemData.map((pointData) => pointData.legendIndex)).toEqual([0, 1]);
            });

            it("should fill correct pointData format", () => {
                expect(pieSeriesItemData.map((pointData) => pointData.format)).toEqual([
                    "#,##0.00",
                    "#,##0.00",
                ]);

                expect(treemapSeriesItemData.map((pointData) => pointData.format)).toEqual([
                    "#,##0.00",
                    "#,##0.00",
                ]);
            });
        });
    });

    describe("getSeries", () => {
        describe("in usecase of bar chart with 3 measures and view by attribute", () => {
            const dv = fixtures.barChartWith3MetricsAndViewByAttribute;
            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dv);

            const attributeColorStrategy = new AttributeColorStrategy(
                DefaultColorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
            );

            const type = "column";
            const seriesData = getSeries(
                dv,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                type,
                attributeColorStrategy,
            );

            it("should return number of series equal to the count of measures", () => {
                expect(seriesData.length).toBe(3);
            });

            it("should fill correct series name", () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.name)).toEqual([
                    "<button>Lost</button> ...",
                    "Won",
                    "Expected",
                ]);
            });

            it("should fill correct series color", () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.color)).toEqual([
                    FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                    SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                    getRgbString(DefaultColorPalette[2]),
                ]);
            });

            it("should fill correct series legendIndex", () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.legendIndex)).toEqual([0, 1, 2]);
            });

            it("should fill correct series data", () => {
                const expectedData = [0, 1, 2].map((seriesIndex: any) => {
                    const parameters = getSeriesItemDataParameters(dv, seriesIndex);
                    const seriesItem = parameters[0];
                    const si = parameters[1];
                    const measureGroup = parameters[2];
                    const viewByAttribute = parameters[3];
                    const stackByAttribute = parameters[4];

                    return getSeriesItemData(
                        seriesItem,
                        si,
                        measureGroup,
                        viewByAttribute,
                        stackByAttribute,
                        type,
                        attributeColorStrategy,
                    );
                });
                expect(seriesData.map((seriesItem: any) => seriesItem.data)).toEqual(expectedData);
            });
        });

        describe("in usecase of bar chart with stack by and view by attributes", () => {
            const dv = fixtures.barChartWithStackByAndViewByAttributes;
            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "column";

            const attributeColorStrategy = new AttributeColorStrategy(
                DefaultColorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
            );

            const seriesData = getSeries(
                dv,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                type,
                attributeColorStrategy,
            );

            it("should return number of series equal to the count of stack by attribute values", () => {
                expect(seriesData.length).toBe(2);
            });

            it("should fill correct series name equal to stack by attribute values", () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.name)).toEqual([
                    "East Coast",
                    "West Coast",
                ]);
            });

            it("should fill correct series color", () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.color)).toEqual([
                    FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                    SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                ]);
            });

            it("should fill correct series legendIndex", () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.legendIndex)).toEqual([0, 1]);
            });

            it("should fill correct series data", () => {
                const expectedData = [0, 1].map((seriesIndex) => {
                    const parameters = getSeriesItemDataParameters(dv, seriesIndex);
                    const seriesItem = parameters[0];
                    const si = parameters[1];
                    const measureGroup = parameters[2];
                    const viewByAttribute = parameters[3];
                    const stackByAttribute = parameters[4];

                    const attributeColorStrategy = new AttributeColorStrategy(
                        DefaultColorPalette,
                        undefined,
                        viewByAttribute,
                        stackByAttribute,
                        dv,
                    );

                    return getSeriesItemData(
                        seriesItem,
                        si,
                        measureGroup,
                        viewByAttribute,
                        stackByAttribute,
                        type,
                        attributeColorStrategy,
                    );
                });
                expect(seriesData.map((seriesItem: any) => seriesItem.data)).toEqual(expectedData);
            });
        });

        describe("in use case of bubble", () => {
            const type = "bubble";

            it("should fill X, Y and Z with valid values when measure buckets are not empty", () => {
                const dv = fixtures.bubbleChartWith2MetricsAndAttributeNoPrimaries;
                const { measureGroup, stackByAttribute } = getMVS(dv);

                const colorStrategy = new BubbleChartColorStrategy(
                    DefaultColorPalette,
                    undefined,
                    null,
                    stackByAttribute,
                    dv,
                );

                const seriesData = getSeries(dv, measureGroup, null, stackByAttribute, type, colorStrategy);

                expect(seriesData).toMatchSnapshot();
            });

            it("should update seriesIndex correctly when one of X, Y or Z has null data", () => {
                const dv = fixtures.bubbleChartWith3MetricsAndAttributeNullsInData;
                const { measureGroup, stackByAttribute } = getMVS(dv);

                const colorStrategy = new BubbleChartColorStrategy(
                    DefaultColorPalette,
                    undefined,
                    null,
                    stackByAttribute,
                    dv,
                );

                const seriesData = getSeries(dv, measureGroup, null, stackByAttribute, type, colorStrategy);

                expect(seriesData).toMatchSnapshot();
            });
        });

        /*
         * This is just borderline ridiculous. _ALL_ the tests in this massive file work with recorded data.
         *
         * ... and then you run into this bubbly mess. All the data mocked-up right in code, dummy-left-and-right.
         *
         * I'm not going to waste time with this.
         */
        /*
            const dummyBucketItem = {
                visualizationAttribute: {
                    localIdentifier: "abc",
                    displayForm: { uri: "abc" },
                },
            };

            const dummyMeasureGroup = {
                items: [
                    {
                        measureHeaderItem: {
                            localIdentifier: "m1",
                            name: "dummyName",
                            format: "#.##x",
                        },
                    },
                ],
            };

            const dummyExecutionResponse: GdcExecution.IExecutionResponse = {
                dimensions: [
                    {
                        headers: [
                            {
                                measureGroupHeader: dummyMeasureGroup,
                            },
                        ],
                    },
                ],
                links: { executionResult: "foo" },
            };

            const stackByAttribute = {
                items: [
                    {
                        attributeHeaderItem: {
                            name: "abc",
                        },
                    },
                    {
                        attributeHeaderItem: {
                            name: "def",
                        },
                    },
                ],
            };

            const colorPalette = [
                {
                    guid: "3",
                    fill: {
                        r: 255,
                        g: 0,
                        b: 0,
                    },
                },
                {
                    guid: "2",
                    fill: {
                        r: 0,
                        g: 255,
                        b: 0,
                    },
                },
            ];

            it("should fill X and Y with zeroes when X and Y measure buckets are empty", () => {
                const executionResultData = [[3], [6]];

                const mdObject = {
                    visualizationClass: { uri: "abc" },
                    buckets: [
                        {
                            localIdentifier: "tertiary_measures",
                            items: [dummyBucketItem],
                        },
                    ],
                };

                const expectedSeries = [
                    {
                        name: "",
                        color: "rgb(255,0,0)",
                        legendIndex: 0,
                        data: [{ x: 0, y: 0, z: 3, format: "#.##x" }],
                    },
                    {
                        name: "",
                        color: undefined,
                        legendIndex: 1,
                        data: [{ x: 0, y: 0, z: 6, format: "#.##x" }],
                    },
                ];

                const colorStrategy = new BubbleChartColorStrategy(
                    colorPalette,
                    undefined,
                    null,
                    stackByAttribute,
                    dummyExecutionResponse,
                    {},
                );

                const series = getBubbleChartSeries(
                    executionResultData,
                    dummyMeasureGroup,
                    null,
                    mdObject,
                    colorStrategy,
                );

                expect(series).toEqual(expectedSeries);
            });

            it("should fill Y with x values when primary bucket is empty but secondary is not", () => {
                const executionResultData = [[1, 3], [4, 6]];

                const mdObject = {
                    visualizationClass: { uri: "abc" },
                    buckets: [
                        {
                            localIdentifier: "secondary_measures",
                            items: [dummyBucketItem],
                        },
                        {
                            localIdentifier: "tertiary_measures",
                            items: [dummyBucketItem],
                        },
                    ],
                };

                const expectedSeries = [
                    {
                        name: "abc",
                        color: "rgb(255,0,0)",
                        legendIndex: 0,
                        data: [{ x: 0, y: 1, z: 3, format: "#.##x" }],
                    },
                    {
                        name: "def",
                        color: undefined,
                        legendIndex: 1,
                        data: [{ x: 0, y: 4, z: 6, format: "#.##x" }],
                    },
                ];

                const colorStrategy = new BubbleChartColorStrategy(
                    colorPalette,
                    undefined,
                    stackByAttribute,
                    stackByAttribute,
                    dummyExecutionResponse,
                    {},
                );

                const series = getBubbleChartSeries(
                    executionResultData,
                    dummyMeasureGroup,
                    stackByAttribute,
                    mdObject,
                    colorStrategy,
                );

                expect(series).toEqual(expectedSeries);
            });

            it("should fill X with x and Z with z values when secondary bucket is empty", () => {
                const executionResultData = [[1, 3], [4, 6]];

                const mdObject = {
                    visualizationClass: { uri: "abc" },
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [dummyBucketItem],
                        },
                        {
                            localIdentifier: "tertiary_measures",
                            items: [dummyBucketItem],
                        },
                    ],
                };

                const expectedSeries = [
                    {
                        name: "abc",
                        color: "rgb(255,0,0)",
                        legendIndex: 0,
                        data: [{ x: 1, y: 0, z: 3, format: "#.##x" }],
                    },
                    {
                        name: "def",
                        color: undefined,
                        legendIndex: 1,
                        data: [{ x: 4, y: 0, z: 6, format: "#.##x" }],
                    },
                ];

                const colorStrategy = new BubbleChartColorStrategy(
                    colorPalette,
                    undefined,
                    stackByAttribute,
                    stackByAttribute,
                    dummyExecutionResponse,
                    null,
                );

                const series = getBubbleChartSeries(
                    executionResultData,
                    dummyMeasureGroup,
                    stackByAttribute,
                    mdObject,
                    colorStrategy,
                );

                expect(series).toEqual(expectedSeries);
            });

            it("should fill Z with NaNs when tertiary bucket is empty", () => {
                const executionResultData = [[1, 3], [4, 6]];

                const mdObject = {
                    visualizationClass: { uri: "abc" },
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [dummyBucketItem],
                        },
                        {
                            localIdentifier: "secondary_measures",
                            items: [dummyBucketItem],
                        },
                    ],
                };

                const expectedSeries = [
                    {
                        name: "abc",
                        color: "rgb(255,0,0)",
                        legendIndex: 0,
                        data: [{ x: 1, y: 3, z: NaN, format: "#.##x" }],
                    },
                    {
                        name: "def",
                        color: undefined,
                        legendIndex: 1,
                        data: [{ x: 4, y: 6, z: NaN, format: "#.##x" }],
                    },
                ];

                const colorStrategy = new BubbleChartColorStrategy(
                    colorPalette,
                    undefined,
                    null,
                    stackByAttribute,
                    dummyExecutionResponse,
                    null,
                );

                const series = getBubbleChartSeries(
                    executionResultData,
                    dummyMeasureGroup,
                    stackByAttribute,
                    mdObject,
                    colorStrategy,
                );

                expect(series).toEqual(expectedSeries);
            });

            it("should handle null in result", () => {
                const executionResultData = [[null, 2, 3], [4, null, 6], [7, 8, null]];
                const stackByAttributeWithThreeElements = {
                    items: [
                        {
                            attributeHeaderItem: {
                                name: "abc",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "def",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "ghi",
                            },
                        },
                    ],
                };
                const mdObject = {
                    visualizationClass: { uri: "abc" },
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [dummyBucketItem],
                        },
                        {
                            localIdentifier: "secondary_measures",
                            items: [dummyBucketItem],
                        },
                        {
                            localIdentifier: "tertiary_measures",
                            items: [dummyBucketItem],
                        },
                    ],
                };
                const colorPaletteWithBlue = [
                    ...colorPalette,
                    {
                        guid: "1",
                        fill: {
                            r: 0,
                            g: 0,
                            b: 255,
                        },
                    },
                ];

                const expectedSeries = [
                    {
                        name: "abc",
                        color: "rgb(255,0,0)",
                        legendIndex: 0,
                        data: [] as any,
                    },
                    {
                        name: "def",
                        color: undefined,
                        legendIndex: 1,
                        data: [],
                    },
                    {
                        name: "ghi",
                        color: undefined,
                        legendIndex: 2,
                        data: [],
                    },
                ];

                const colorStrategy = new BubbleChartColorStrategy(
                    colorPaletteWithBlue,
                    undefined,
                    null,
                    stackByAttributeWithThreeElements,
                    dummyExecutionResponse,
                    null,
                );

                const series = getBubbleChartSeries(
                    executionResultData,
                    dummyMeasureGroup,
                    stackByAttributeWithThreeElements,
                    mdObject,
                    colorStrategy,
                );

                expect(series).toEqual(expectedSeries);
            });
        });
        */

        describe("in use case of treemap", () => {
            describe("with only one measure", () => {
                const dv = fixtures.barChartWithSingleMeasureAndNoAttributes;
                const { measureGroup, viewByAttribute, stackByAttribute } = getMVSTreemap(dv);
                const type = "treemap";

                const treeMapColorStrategy = new TreemapColorStrategy(
                    DefaultColorPalette,
                    undefined,
                    viewByAttribute,
                    stackByAttribute,
                    dv,
                );

                const seriesData = getSeries(
                    dv,
                    measureGroup,
                    viewByAttribute,
                    stackByAttribute,
                    type,
                    treeMapColorStrategy,
                );

                it("should return only one serie", () => {
                    expect(seriesData.length).toBe(1);
                });

                it("should fill correct series name equal to measure name", () => {
                    expect(seriesData[0].name).toEqual("Amount");
                });

                it("should fill correct series color", () => {
                    expect(seriesData[0].color).toEqual(FIRST_DEFAULT_COLOR_ITEM_AS_STRING);
                });

                it("should fill correct series legendIndex", () => {
                    expect(seriesData[0].legendIndex).toEqual(0);
                });

                it("should fill correct series data", () => {
                    expect(seriesData[0].data.length).toBe(1);
                    expect(seriesData[0].data[0]).toMatchObject({
                        value: 116625456.54,
                        color: FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                        format: "#,##0.00",
                        legendIndex: 0,
                        name: "Amount",
                    });
                });
            });

            describe("with one measure and view by attribute", () => {
                const dv = fixtures.treemapWithMetricAndViewByAttribute;
                const { measureGroup, viewByAttribute, stackByAttribute } = getMVSTreemap(dv);
                const type = "treemap";
                const treeMapColorStrategy = new TreemapColorStrategy(
                    DefaultColorPalette,
                    undefined,
                    viewByAttribute,
                    stackByAttribute,
                    dv,
                );
                const seriesData = getSeries(
                    dv,
                    measureGroup,
                    viewByAttribute,
                    stackByAttribute,
                    type,
                    treeMapColorStrategy,
                );

                it("should return only one serie", () => {
                    expect(seriesData.length).toBe(1);
                });

                it("should fill correct series name equal to measure name", () => {
                    expect(seriesData[0].name).toEqual("Amount");
                });

                it("should fill correct series legendIndex", () => {
                    expect(seriesData[0].legendIndex).toEqual(0);
                });

                it("should fill correct series data", () => {
                    expect(seriesData[0].data.length).toBe(2);
                    expect(seriesData[0].data[0]).toMatchObject({
                        value: 80406324.96,
                        color: FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                        format: "#,##0.00",
                        legendIndex: 0,
                        name: "Direct Sales",
                    });

                    expect(seriesData[0].data[1]).toMatchObject({
                        value: 36219131.58,
                        color: SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                        format: "#,##0.00",
                        legendIndex: 1,
                        name: "Inside Sales",
                    });
                });
            });

            describe("with one measure and stack by attribute", () => {
                const dv = fixtures.treemapWithMetricAndStackByAttribute;
                const { measureGroup, viewByAttribute, stackByAttribute } = getMVSTreemap(dv);
                const type = "treemap";

                const treeMapColorStrategy = new TreemapColorStrategy(
                    DefaultColorPalette,
                    undefined,
                    viewByAttribute,
                    stackByAttribute,
                    dv,
                );

                const seriesData = getSeries(
                    dv,
                    measureGroup,
                    viewByAttribute,
                    stackByAttribute,
                    type,
                    treeMapColorStrategy,
                );

                it("should return only one serie", () => {
                    expect(seriesData.length).toBe(1);
                });

                it("should fill correct series name equal to measure name", () => {
                    expect(seriesData[0].name).toEqual("Amount");
                });

                it("should fill correct series data", () => {
                    expect(seriesData[0].data.length).toBe(3); // parent + 2 leafs

                    expect(seriesData[0].data[0]).toMatchObject({
                        id: "0",
                        name: "Amount",
                        color: FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                        showInLegend: true,
                        legendIndex: 0,
                        format: "#,##0.00",
                    });

                    expect(seriesData[0].data[1]).toMatchObject({
                        parent: "0",
                        x: 0,
                        y: 0,
                        value: 80406324.96,
                        color: FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                        format: "#,##0.00",
                        showInLegend: false,
                        name: "Direct Sales",
                    });

                    expect(seriesData[0].data[2]).toMatchObject({
                        parent: "0",
                        x: 0,
                        y: 1,
                        value: 36219131.58,
                        color: getLighterColor(FIRST_DEFAULT_COLOR_ITEM_AS_STRING, 0.4),
                        format: "#,##0.00",
                        showInLegend: false,
                        name: "Inside Sales",
                    });
                });
            });

            describe("with one measure, view by and stack by attribute", () => {
                const dv = fixtures.treemapWithMetricViewByAndStackByAttribute;
                const { measureGroup, viewByAttribute, stackByAttribute } = getMVSTreemap(dv);
                const type = "treemap";
                const treeMapColorStrategy = new TreemapColorStrategy(
                    DefaultColorPalette,
                    undefined,
                    viewByAttribute,
                    stackByAttribute,
                    dv,
                );
                const seriesData = getSeries(
                    dv,
                    measureGroup,
                    viewByAttribute,
                    stackByAttribute,
                    type,
                    treeMapColorStrategy,
                );

                it("should return only one serie", () => {
                    expect(seriesData.length).toBe(1);
                });

                it("should fill correct series name equal to measure name", () => {
                    expect(seriesData[0].name).toEqual("Amount");
                });

                it("should fill correct series data", () => {
                    expect(seriesData[0].data.length).toBe(6); // 2 parents + 2 * 2 leafs

                    expect(seriesData[0].data[0]).toMatchObject({
                        id: "0",
                        name: "Direct Sales",
                        color: FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                        showInLegend: true,
                        legendIndex: 0,
                        format: "#,##0.00",
                    });
                    expect(seriesData[0].data[1]).toMatchObject({
                        id: "1",
                        name: "Inside Sales",
                        color: SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                        showInLegend: true,
                        legendIndex: 1,
                        format: "#,##0.00",
                    });

                    expect(seriesData[0].data[2]).toMatchObject({
                        parent: "0",
                        x: 0,
                        y: 0,
                        value: 58427629.5,
                        color: FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                        format: "#,##0.00",
                        showInLegend: false,
                        name: "West Coast",
                    });

                    expect(seriesData[0].data[3]).toMatchObject({
                        parent: "0",
                        x: 1,
                        y: 1,
                        value: 21978695.46,
                        color: getLighterColor(FIRST_DEFAULT_COLOR_ITEM_AS_STRING, 0.4),
                        format: "#,##0.00",
                        showInLegend: false,
                        name: "East Coast",
                    });

                    expect(seriesData[0].data[4]).toMatchObject({
                        parent: "1",
                        x: 2,
                        y: 2,
                        value: 30180730.62,
                        color: SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                        format: "#,##0.00",
                        showInLegend: false,
                        name: "West Coast",
                    });

                    expect(seriesData[0].data[5]).toMatchObject({
                        parent: "1",
                        x: 3,
                        y: 3,
                        value: 6038400.96,
                        color: getLighterColor(SECOND_DEFAULT_COLOR_ITEM_AS_STRING, 0.4),
                        format: "#,##0.00",
                        showInLegend: false,
                        name: "East Coast",
                    });
                });
            });

            describe("with two measures and stack by attribute including client sorting", () => {
                const dv = fixtures.treemapWithTwoMetricsAndStackByAttribute;
                const { measureGroup, viewByAttribute, stackByAttribute } = getMVSTreemap(dv);
                const type = "treemap";
                const treeMapColorStrategy = new TreemapColorStrategy(
                    DefaultColorPalette,
                    undefined,
                    viewByAttribute,
                    stackByAttribute,
                    dv,
                );
                const seriesData = getSeries(
                    dv,
                    measureGroup,
                    viewByAttribute,
                    stackByAttribute,
                    type,
                    treeMapColorStrategy,
                );

                it("should return only one serie", () => {
                    expect(seriesData.length).toBe(1);
                });

                it("should fill correct series name equal to measure name", () => {
                    expect(seriesData[0].name).toEqual("Amount, # of Open Opps.");
                });

                it("should fill correct series data", () => {
                    expect(seriesData[0].data.length).toBe(6); // 2 parents + 2 * 2 leafs

                    expect(seriesData[0].data[0]).toMatchObject({
                        id: "0",
                        name: "Amount",
                        color: FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                        showInLegend: true,
                        legendIndex: 0,
                        format: "#,##0.00",
                    });
                    expect(seriesData[0].data[1]).toMatchObject({
                        id: "1",
                        name: "# of Open Opps.",
                        color: SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                        showInLegend: true,
                        legendIndex: 1,
                        format: "#,##0.00",
                    });

                    expect(seriesData[0].data[2]).toMatchObject({
                        parent: "0",
                        x: 0,
                        y: 0,
                        value: 58427629.5,
                        color: FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                        format: "#,##0.00",
                        showInLegend: false,
                        name: "Direct Sales",
                    });

                    expect(seriesData[0].data[3]).toMatchObject({
                        parent: "0",
                        x: 0,
                        y: 1,
                        value: 21978695.46,
                        color: getLighterColor(FIRST_DEFAULT_COLOR_ITEM_AS_STRING, 0.4),
                        format: "#,##0.00",
                        showInLegend: false,
                        name: "Inside Sales",
                    });

                    expect(seriesData[0].data[4]).toMatchObject({
                        parent: "1",
                        x: 1,
                        y: 1,
                        value: 30180730.62,
                        color: SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                        format: "#,##0.00",
                        showInLegend: false,
                        name: "Inside Sales",
                    });

                    expect(seriesData[0].data[5]).toMatchObject({
                        parent: "1",
                        x: 1,
                        y: 0,
                        value: 6038400.96,
                        color: getLighterColor(SECOND_DEFAULT_COLOR_ITEM_AS_STRING, 0.4),
                        format: "#,##0.00",
                        showInLegend: false,
                        name: "Direct Sales",
                    });
                });
            });
        });

        describe("in use case of heatmap", () => {
            const dv = fixtures.heatMapWithEmptyCells;
            const { measureGroup } = getMVS(dv);
            const heatmapSeries = getHeatmapSeries(dv, measureGroup);
            const heatmapDataPoints = heatmapSeries[0].data;
            const firstEmptyCellIndex = findIndex(heatmapDataPoints, (point) => isNil(point.value));

            it("should return only one series", () => {
                expect(heatmapSeries.length).toBe(1);
            });

            it("should have two data points at null value", () => {
                const nullDataCount = 3;
                const nullPointCount = heatmapSeries[0].data.map((data) => data.value).filter(isNil).length;
                expect(nullPointCount).toBe(nullDataCount * 2);
            });

            it("should first empty point have gray border", () => {
                const { borderColor, borderWidth, pointPadding, color } =
                    heatmapDataPoints[firstEmptyCellIndex];
                expect(borderColor).toEqual(GRAY);
                expect(borderWidth).toBe(0);
                expect(pointPadding).toBe(undefined);
                expect(color).toBe(TRANSPARENT);
            });

            it("should second empty point have stripes inside", () => {
                const { borderColor, borderWidth, pointPadding, color } =
                    heatmapDataPoints[firstEmptyCellIndex + 1];
                expect(borderColor).toBe(undefined);
                expect(borderWidth).toBe(0);
                expect(pointPadding).toBe(2);
                expect(typeof color).not.toBe("string");
            });
        });
    });

    describe("getDrillableSeries", () => {
        describe("in usecase of scatter plot with 2 measures and attribute", () => {
            const dv = fixtures.barChartWith3MetricsAndViewByAttribute;
            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "scatter";

            const metricColorStrategy = new MeasureColorStrategy(
                DefaultColorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
            );

            const seriesWithoutDrillability = getSeries(
                dv,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                type,
                metricColorStrategy,
            );

            const drillableMeasures = [
                HeaderPredicates.uriMatch("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283"),
            ];
            const drillableMeasuresSeriesData = getDrillableSeries(
                dv,
                seriesWithoutDrillability,
                drillableMeasures,
                [viewByAttribute],
                stackByAttribute,
                type,
            );

            it("should assign correct drillIntersection to pointData with drilldown true", () => {
                expect(
                    drillableMeasuresSeriesData.map(
                        (seriesItem: any) => seriesItem.data[0].drillIntersection,
                    ),
                ).toMatchSnapshot();
            });

            it("should fillter out points with one or both coordinates null", () => {
                const dv = fixtures.scatterPlotWith2MetricsAndAttributeNullsInData;
                const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dv);
                const type = "scatter";

                const metricColorStrategy = new MeasureColorStrategy(
                    DefaultColorPalette,
                    undefined,
                    viewByAttribute,
                    stackByAttribute,
                    dv,
                );

                const seriesWithoutDrillability = getSeries(
                    dv,
                    measureGroup,
                    viewByAttribute,
                    stackByAttribute,
                    type,
                    metricColorStrategy,
                );

                const drillableMeasures = [
                    HeaderPredicates.uriMatch("/gdc/md/adtxv0e7evvx6dawu7t2jju5a6r73eua/obj/13465"),
                ];
                const drillableMeasuresSeriesData = getDrillableSeries(
                    dv,
                    seriesWithoutDrillability,
                    drillableMeasures,
                    [viewByAttribute],
                    stackByAttribute,
                    type,
                );
                expect(seriesWithoutDrillability[0].data.length).toEqual(6);
                expect(drillableMeasuresSeriesData[0].data.length).toEqual(3);
            });
        });

        describe("in usecase of bubble chart with 3 measures and attribute", () => {
            const dv = fixtures.bubbleChartWith3MetricsAndAttribute;
            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "bubble";

            const attributeColorStrategy = new AttributeColorStrategy(
                DefaultColorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
            );

            const seriesWithoutDrillability = getSeries(
                dv,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                type,
                attributeColorStrategy,
            );
            const drillableMeasures = [
                HeaderPredicates.uriMatch("/gdc/md/hzyl5wlh8rnu0ixmbzlaqpzf09ttb7c8/obj/67097"),
            ];
            const drillableMeasuresSeriesData = getDrillableSeries(
                dv,
                seriesWithoutDrillability,
                drillableMeasures,
                [viewByAttribute],
                stackByAttribute,
                type,
            );

            it("should assign correct drillIntersection to pointData with drilldown true", () => {
                expect(drillableMeasuresSeriesData.length).toBe(20);
                expect(drillableMeasuresSeriesData[8].data[0]).toMatchSnapshot();
                drillableMeasuresSeriesData.forEach((seriesItem: any, index: number) => {
                    expect(seriesItem.isDrillable).toEqual(true);
                    expect(seriesItem.legendIndex).toEqual(index);
                    expect(seriesItem.data[0].drilldown).toEqual(true);
                });
            });

            it("should fillter out points with some of measures are null", () => {
                const dv = fixtures.bubbleChartWith3MetricsAndAttributeNullsInData;
                const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dv);
                const type = "bubble";

                const attributeColorStrategy = new AttributeColorStrategy(
                    DefaultColorPalette,
                    undefined,
                    viewByAttribute,
                    stackByAttribute,
                    dv,
                );

                const seriesWithoutDrillability = getSeries(
                    dv,
                    measureGroup,
                    viewByAttribute,
                    stackByAttribute,
                    type,
                    attributeColorStrategy,
                );

                const drillableMeasures = [
                    HeaderPredicates.uriMatch("/gdc/md/hzyl5wlh8rnu0ixmbzlaqpzf09ttb7c8/obj/13465"),
                ];
                const drillableMeasuresSeriesData = getDrillableSeries(
                    dv,
                    seriesWithoutDrillability,
                    drillableMeasures,
                    [viewByAttribute],
                    stackByAttribute,
                    type,
                );
                expect(drillableMeasuresSeriesData.length).toEqual(16);
            });
        });

        describe("in usecase of bar chart with 6 pop measures and view by attribute", () => {
            const dv = fixtures.barChartWithPopMeasureAndViewByAttributeX6;

            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "bar";
            const metricColorStrategy = new MeasureColorStrategy(
                DefaultColorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
            );
            const seriesWithoutDrillability = getSeries(
                dv,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                type,
                metricColorStrategy,
            );

            describe("with all drillable measures", () => {
                // setting drills on all measure series by setting drill on the attr they are sliced by
                const drillableAttr = [
                    HeaderPredicates.uriMatch("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/158"),
                ];
                const drillableMeasuresSeriesData = getDrillableSeries(
                    dv,
                    seriesWithoutDrillability,
                    drillableAttr,
                    [viewByAttribute],
                    stackByAttribute,
                    type,
                );

                it("should assign correct drillIntersection to pointData with drilldown true", () => {
                    const startYear = parseInt(
                        // should be 2008
                        drillableMeasuresSeriesData[0].data[0].drillIntersection[1].title,
                        10,
                    );
                    drillableMeasuresSeriesData.forEach((seriesItem: any) => {
                        seriesItem.data.forEach((point: any, index: number) => {
                            expect(point.drillIntersection[1].title - index).toEqual(startYear);
                        });
                    });
                });
            });
        });

        describe("in usecase of bar chart with 6 previous period measures", () => {
            const dv = fixtures.barChartWithPreviousPeriodMeasureX6;
            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "bar";
            const metricColorStrategy = new MeasureColorStrategy(
                DefaultColorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
            );
            const seriesWithoutDrillability = getSeries(
                dv,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                type,
                metricColorStrategy,
            );

            describe("with all drillable measures", () => {
                const drillableMeasures = [
                    HeaderPredicates.uriMatch("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/324"),
                ];
                const drillableMeasuresSeriesData = getDrillableSeries(
                    dv,
                    seriesWithoutDrillability,
                    drillableMeasures,
                    [viewByAttribute],
                    stackByAttribute,
                    type,
                );

                it("should assign correct drillIntersection to pointData with drilldown true", () => {
                    const startYear = parseInt(
                        // should be 2008
                        drillableMeasuresSeriesData[0].data[0].drillIntersection[1].value,
                        10,
                    );
                    drillableMeasuresSeriesData.forEach((seriesItem: any) => {
                        seriesItem.data.forEach((point: any, index: number) => {
                            expect(point.drillIntersection[1].value - index).toEqual(startYear);
                        });
                    });
                });
            });
        });

        describe("in usecase of bar chart with 3 measures and view by attribute", () => {
            const dv = fixtures.barChartWith3MetricsAndViewByAttribute;
            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "column";

            const attColorStrategy = new AttributeColorStrategy(
                DefaultColorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
            );

            const seriesWithoutDrillability = getSeries(
                dv,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                type,
                attColorStrategy,
            );

            describe("with no drillable items", () => {
                const noDrillableItems: any = [];
                const noDrillableSeriesData = getDrillableSeries(
                    dv,
                    seriesWithoutDrillability,
                    noDrillableItems,
                    [viewByAttribute],
                    stackByAttribute,
                    type,
                );
                it("should return the same number of items as seriesWithoutDrillability", () => {
                    expect(noDrillableSeriesData.length).toBe(seriesWithoutDrillability.length);
                });

                it("should return new series array with isDrillable false", () => {
                    expect(noDrillableSeriesData).not.toBe(seriesWithoutDrillability);
                    expect(noDrillableSeriesData.map((seriesItem: any) => seriesItem.isDrillable)).toEqual([
                        false,
                        false,
                        false,
                    ]);
                });

                it("should return new pointData items drilldown false and no drillIntersection", () => {
                    expect(
                        noDrillableSeriesData.map((seriesItem: any) =>
                            seriesItem.data.map(({ drilldown, drillIntersection }: any) => {
                                return { drilldown, drillIntersection };
                            }),
                        ),
                    ).toEqual([
                        [
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                        ],
                        [
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                        ],
                        [
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                        ],
                    ]);
                });
            });

            describe("with first and last drillable measures", () => {
                const twoDrillableMeasuresItems = [
                    HeaderPredicates.uriMatch("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283"),
                    HeaderPredicates.uriMatch("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1285"),
                ];
                const twoDrillableMeasuresSeriesData = getDrillableSeries(
                    dv,
                    seriesWithoutDrillability,
                    twoDrillableMeasuresItems,
                    [viewByAttribute],
                    stackByAttribute,
                    type,
                );
                it("should return the same number of items as seriesWithoutDrillability", () => {
                    expect(twoDrillableMeasuresSeriesData.length).toBe(seriesWithoutDrillability.length);
                });

                it("should return new series array with isDrillable true for the first and last measure ", () => {
                    expect(
                        twoDrillableMeasuresSeriesData.map((seriesItem: any) => seriesItem.isDrillable),
                    ).toEqual([true, false, true]);
                });

                it("should assign new pointData items with drilldown true in the first and last serie", () => {
                    expect(
                        twoDrillableMeasuresSeriesData.map((seriesItem: any) =>
                            seriesItem.data.map((pointData: any) => pointData.drilldown),
                        ),
                    ).toEqual([
                        [true, true, true, true, true],
                        [false, false, false, false, false],
                        [true, true, true, true, true],
                    ]);
                });

                it("should assign correct drillIntersection to pointData with drilldown true", () => {
                    expect(
                        twoDrillableMeasuresSeriesData.map(
                            (seriesItem: any) => seriesItem.data[0].drillIntersection,
                        ),
                    ).toMatchSnapshot();
                });
            });
        });

        describe("in usecase of bar chart with stack by and view by attributes", () => {
            const dv = fixtures.barChartWithStackByAndViewByAttributes;
            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "column";

            const attColorStrategy = new AttributeColorStrategy(
                DefaultColorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
            );

            const seriesData = getSeries(
                dv,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                type,
                attColorStrategy,
            );

            it("should return number of series equal to the count of stack by attribute values", () => {
                expect(seriesData.length).toBe(2);
            });

            it("should fill correct series name equal to stack by attribute values", () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.name)).toEqual([
                    "East Coast",
                    "West Coast",
                ]);
            });

            it("should fill correct series color", () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.color)).toEqual([
                    FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                    SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                ]);
            });

            it("should fill correct series legendIndex", () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.legendIndex)).toEqual([0, 1]);
            });

            it("should fill correct series data", () => {
                const expectedData = [0, 1].map((seriesIndex: any) => {
                    const parameters = getSeriesItemDataParameters(dv, seriesIndex);
                    const seriesItem = parameters[0];
                    const si = parameters[1];
                    const measureGroup = parameters[2];
                    const viewByAttribute = parameters[3];
                    const stackByAttribute = parameters[4];

                    return getSeriesItemData(
                        seriesItem,
                        si,
                        measureGroup,
                        viewByAttribute,
                        stackByAttribute,
                        type,
                        attColorStrategy,
                    );
                });
                expect(seriesData.map((seriesItem: any) => seriesItem.data)).toEqual(expectedData);
            });
        });
    });

    describe("customEscape", () => {
        it("should encode some characters into named html entities", () => {
            const source = '&"<>';
            const expected = "&amp;&quot;&lt;&gt;";
            expect(customEscape(source)).toBe(expected);
        });
        it("should keep &lt; and &gt; untouched (unescape -> escape)", () => {
            const source = "&lt;&gt;";
            const expected = "&lt;&gt;";
            expect(customEscape(source)).toBe(expected);
        });
    });

    describe("buildTooltipFactory", () => {
        const dv = fixtures.barChartWithViewByAttribute;
        const { viewByAttribute } = getMVS(dv);
        const pointData = {
            y: 1,
            format: "# ###",
            name: "point",
            category: {
                name: "category",
            },
            series: {
                name: "series",
            },
        };

        describe("unescaping angle brackets and htmlescaping the whole value", () => {
            const tooltipFn = buildTooltipFactory(viewByAttribute, "column");

            it("should keep &lt; and &gt; untouched (unescape -> escape)", () => {
                const tooltip = tooltipFn(
                    {
                        ...pointData,
                        series: {
                            name: "&lt;series&gt;",
                        },
                    },
                    DEFAULT_TOOLTIP_CONTENT_WIDTH,
                );
                expect(getValues(tooltip)).toEqual(["Department", "category", "&lt;series&gt;", " 1"]);
            });

            it("should escape other html chars in series name and have output properly escaped", () => {
                const tooltip = tooltipFn(
                    {
                        ...pointData,
                        series: {
                            name: "\"&'&lt;",
                        },
                    },
                    DEFAULT_TOOLTIP_CONTENT_WIDTH,
                );
                expect(getValues(tooltip)).toEqual(["Department", "category", "&quot;&amp;&#39;&lt;", " 1"]);
            });

            it("should unescape brackets and htmlescape category", () => {
                const tooltip = tooltipFn(
                    {
                        ...pointData,
                        category: {
                            name: "&gt;\"&'&lt;",
                        },
                    },
                    DEFAULT_TOOLTIP_CONTENT_WIDTH,
                );
                expect(getValues(tooltip)).toEqual([
                    "Department",
                    "&gt;&quot;&amp;&#39;&lt;",
                    "series",
                    " 1",
                ]);
            });
        });

        it.each([
            ["number", false, false, false, " 1"],
            ["number", false, false, true, " 1"],
            ["number", false, true, false, " 1"],
            ["number", false, true, true, " 1"],
            ["percent", true, false, false, "49.01%"],
            ["percent", true, false, true, "49.01%"],
            ["percent", true, true, false, "49.01%"],
            ["number", true, true, true, " 1"],
        ])(
            "should render %s when stackMeasuresToPercent is %s, isDualAxis is %s and isSecondAxis is %s",
            (
                _type: string,
                stackMeasuresToPercent: boolean,
                isDualAxis: boolean,
                isSecondAxis: boolean,
                formattedValue: string,
            ) => {
                const tooltipFn = buildTooltipFactory(
                    viewByAttribute,
                    "column",
                    {
                        stackMeasuresToPercent,
                    },
                    isDualAxis,
                );

                const testData = { ...pointData };
                set(testData, ["series", "yAxis", "opposite"], isSecondAxis);

                const tooltip = tooltipFn(testData, DEFAULT_TOOLTIP_CONTENT_WIDTH, 49.0111);
                expect(getValues(tooltip)).toEqual(["Department", "category", "series", formattedValue]);
            },
        );

        it("should render correct values in usecase of bar chart without attribute", () => {
            const tooltipFn = buildTooltipFactory(null, "column");
            const tooltip = tooltipFn(pointData, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual(["series", " 1"]);
        });

        it("should render correct values in usecase of pie chart with an attribute", () => {
            const tooltipFn = buildTooltipFactory(viewByAttribute, "pie");
            const tooltip = tooltipFn(pointData, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual(["Department", "category", "series", " 1"]);
        });

        it("should render correct values in usecase of pie chart with measures", () => {
            const tooltipFn = buildTooltipFactory(null, "pie");
            const tooltip = tooltipFn(pointData, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual(["point", " 1"]);
        });

        it("should render correct values in usecase of treemap chart with an attribute", () => {
            const tooltipFn = buildTooltipFactory(viewByAttribute, "treemap");
            const tooltip = tooltipFn(pointData, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual(["Department", "category", "series", " 1"]);
        });

        it("should render correct values in usecase of treemap chart with measures", () => {
            const tooltipFn = buildTooltipFactory(null, "treemap");
            const tooltip = tooltipFn(pointData, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual(["point", " 1"]);
        });

        it("should generate correct tooltip for chart with small width", () => {
            const chartConfig: IChartConfig = {
                type: "donut",
            };

            const tooltipFn = buildTooltipFactory(viewByAttribute, "donut", chartConfig);
            const tooltip = tooltipFn(pointForSmallCharts, SMALL_TOOLTIP_CONTENT_WIDTH);
            expect(getStyleMaxWidth(tooltip)).toEqual([
                "180",
                "180",
                "180",
                "180",
                "180",
                "180",
                "180",
                "180",
            ]);
        });
    });

    describe("buildTooltipForTwoAttributesFactory", () => {
        const dv = fixtures.barChartWith4MetricsAndViewByTwoAttributes;
        const { viewByAttribute, viewByParentAttribute } = getMVSForViewByTwoAttributes(dv);
        const pointData = {
            y: 1,
            format: "# ###",
            name: "point",
            category: {
                name: "category",
                parent: {
                    name: "parent category",
                },
            },
            series: {
                name: "series",
            },
        };

        it("should render correct values in usecase of bar chart without attribute", () => {
            const tooltipFn = buildTooltipForTwoAttributesFactory(null, null);
            const tooltip = tooltipFn(pointData, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual(["series", " 1"]);
        });

        it("should render correct values in usecase of bar chart with no attribute and no category", () => {
            const tooltipFn = buildTooltipForTwoAttributesFactory(null, null);
            const tooltip = tooltipFn(
                {
                    y: 1,
                    format: "# ###",
                    name: "point",
                    series: {
                        name: "series",
                    },
                },
                DEFAULT_TOOLTIP_CONTENT_WIDTH,
            );
            expect(getValues(tooltip)).toEqual(["series", " 1"]);
        });

        it("should render correct values in usecase of bar chart with one attribute", () => {
            const tooltipFn = buildTooltipForTwoAttributesFactory(viewByAttribute, null);
            const tooltip = tooltipFn(pointData, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual(["Region", "category", "series", " 1"]);
        });

        it("should render correct values in usecase of bar chart with one attribute and no category", () => {
            const tooltipFn = buildTooltipForTwoAttributesFactory(viewByAttribute, null);
            const tooltip = tooltipFn(
                {
                    y: 1,
                    format: "# ###",
                    name: "point",
                    series: {
                        name: "series",
                    },
                },
                DEFAULT_TOOLTIP_CONTENT_WIDTH,
            );
            expect(getValues(tooltip)).toEqual(["series", " 1"]);
        });

        it("should render correct values in usecase of bar chart with two attributes", () => {
            const tooltipFn = buildTooltipForTwoAttributesFactory(viewByAttribute, viewByParentAttribute);
            const tooltip = tooltipFn(pointData, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual([
                "Department",
                "parent category",
                "Region",
                "category",
                "series",
                " 1",
            ]);
        });

        it("should render correct values in usecase of bar chart with two attributes and no category.parent", () => {
            const tooltipFn = buildTooltipForTwoAttributesFactory(viewByAttribute, viewByParentAttribute);
            const tooltip = tooltipFn(
                {
                    y: 1,
                    format: "# ###",
                    name: "point",
                    category: {
                        name: "category",
                    },
                    series: {
                        name: "series",
                    },
                },
                DEFAULT_TOOLTIP_CONTENT_WIDTH,
            );
            expect(getValues(tooltip)).toEqual(["Region", "category", "series", " 1"]);
        });

        it.each([
            ["number", false, false, false, " 1"],
            ["number", false, false, true, " 1"],
            ["number", false, true, false, " 1"],
            ["number", false, true, true, " 1"],
            ["percent", true, false, false, "49.01%"],
            ["percent", true, false, true, "49.01%"],
            ["percent", true, true, false, "49.01%"],
            ["number", true, true, true, " 1"],
        ])(
            "should render %s when stackMeasuresToPercent is %s, isDualAxis is %s and isSecondAxis is %s",
            (
                _type: string,
                stackMeasuresToPercent: boolean,
                isDualAxis: boolean,
                isSecondAxis: boolean,
                formattedValue: string,
            ) => {
                const tooltipFn = buildTooltipForTwoAttributesFactory(
                    viewByAttribute,
                    viewByParentAttribute,
                    {
                        stackMeasuresToPercent,
                    },
                    isDualAxis,
                );

                const testData = { ...pointData };
                set(testData, ["series", "yAxis", "opposite"], isSecondAxis);

                const tooltip = tooltipFn(testData, DEFAULT_TOOLTIP_CONTENT_WIDTH, 49.0111);
                expect(getValues(tooltip)).toEqual([
                    "Department",
                    "parent category",
                    "Region",
                    "category",
                    "series",
                    formattedValue,
                ]);
            },
        );

        it("should generate correct tooltip for chart with small width", () => {
            const chartConfig: IChartConfig = {
                type: "donut",
            };

            const tooltipFn = buildTooltipForTwoAttributesFactory(
                viewByAttribute,
                viewByParentAttribute,
                chartConfig,
            );
            const tooltip = tooltipFn(pointForSmallCharts, SMALL_TOOLTIP_CONTENT_WIDTH);
            expect(getStyleMaxWidth(tooltip)).toEqual(["180", "180", "180", "180"]);
        });
    });

    describe("generateTooltipXYFn", () => {
        const dv = fixtures.bubbleChartWith3MetricsAndAttribute;
        const { measureGroup, stackByAttribute } = getMVS(dv);

        const point: IUnsafeHighchartsTooltipPoint = {
            value: 300,
            name: "point name",
            x: 10,
            y: 20,
            z: 30,
            series: {
                name: "serie name",
                userOptions: {
                    dataLabels: {
                        formatGD: "abcd",
                    },
                },
            },
        };
        it("should generate valid tooltip for no measures", () => {
            const measures: any[] = [];

            const tooltipFn = generateTooltipXYFn(measures, stackByAttribute);
            const tooltip = tooltipFn(point, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual(["Sales Rep", "point name"]);
        });

        it("should generate valid tooltip for 1 measure", () => {
            const measures = [measureGroup.items[0]];

            const tooltipFn = generateTooltipXYFn(measures, stackByAttribute);
            const tooltip = tooltipFn(point, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual(["Sales Rep", "point name", "_Snapshot [EOP-2]", "10.00"]);
        });

        it("should generate valid tooltip for 2 measures", () => {
            const measures = [measureGroup.items[0], measureGroup.items[1]];

            const tooltipFn = generateTooltipXYFn(measures, stackByAttribute);
            const tooltip = tooltipFn(point, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual([
                "Sales Rep",
                "point name",
                "_Snapshot [EOP-2]",
                "10.00",
                "# of Open Opps.",
                "20",
            ]);
        });

        it("should generate valid tooltip for 3 measures", () => {
            const measures = [measureGroup.items[0], measureGroup.items[1], measureGroup.items[2]];

            const tooltipFn = generateTooltipXYFn(measures, stackByAttribute);
            const tooltip = tooltipFn(point, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual([
                "Sales Rep",
                "point name",
                "_Snapshot [EOP-2]",
                "10.00",
                "# of Open Opps.",
                "20",
                "Remaining Quota",
                "$30.00",
            ]);
        });

        it("should generate valid tooltip for point without name using name of serie", () => {
            const measures = [measureGroup.items[0], measureGroup.items[1], measureGroup.items[2]];
            const pointWithoutName = cloneDeep(point);
            pointWithoutName.name = undefined;

            const tooltipFn = generateTooltipXYFn(measures, stackByAttribute);
            const tooltip = tooltipFn(point, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual([
                "Sales Rep",
                "point name",
                "_Snapshot [EOP-2]",
                "10.00",
                "# of Open Opps.",
                "20",
                "Remaining Quota",
                "$30.00",
            ]);
        });

        it("should generate correct tooltip for chart with small width", () => {
            const chartConfig: IChartConfig = {
                type: "donut",
            };
            const measures = [measureGroup.items[0], measureGroup.items[1], measureGroup.items[2]];
            const pointWithoutName = cloneDeep(point);
            pointWithoutName.name = undefined;

            const tooltipFn = generateTooltipXYFn(measures, stackByAttribute, chartConfig);
            const tooltip = tooltipFn(pointForSmallCharts, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual([
                "Sales Rep",
                "name",
                "_Snapshot [EOP-2]",
                "0.00",
                "# of Open Opps.",
                "0",
                "Remaining Quota",
                "NaN",
            ]);
        });
    });

    describe("buildTooltipTreemapFactory", () => {
        const point: IUnsafeHighchartsTooltipPoint = {
            category: {
                name: "category",
            },
            node: {
                isLeaf: true,
            },
            value: 300,
            name: "point name",
            x: 0,
            y: 0,
            series: {
                name: "serie name",
                userOptions: {
                    dataLabels: {
                        formatGD: "abcd",
                    },
                },
            },
        };
        it("should generate valid tooltip for 1 measure", () => {
            const tooltipFn = buildTooltipTreemapFactory(null, null);
            const tooltip = tooltipFn(point, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual(["category", "300"]);
        });

        it("should respect measure format", () => {
            const pointWithFormat = cloneDeep(point);
            pointWithFormat.format = "abcd";

            const tooltipFn = buildTooltipTreemapFactory(null, null);
            const tooltip = tooltipFn(pointWithFormat, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual(["category", "abcd"]);
        });

        it("should generate valid tooltip for 1 measure and view by", () => {
            const dv = fixtures.treemapWithMetricAndViewByAttribute;
            const { viewByAttribute, stackByAttribute } = getMVSTreemap(dv);

            const tooltipFn = buildTooltipTreemapFactory(viewByAttribute, stackByAttribute);
            const tooltip = tooltipFn(point, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual(["Department", "Direct Sales", "serie name", "300"]);
        });

        it("should generate valid tooltip for 1 measure and stack by", () => {
            const dv = fixtures.treemapWithMetricAndStackByAttribute;
            const { viewByAttribute, stackByAttribute } = getMVSTreemap(dv);

            const tooltipFn = buildTooltipTreemapFactory(viewByAttribute, stackByAttribute);
            const tooltip = tooltipFn(point, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual(["Department", "Direct Sales", "category", "300"]);
        });

        it("should generate valid tooltip for 1 measure, view by and stack by", () => {
            const dv = fixtures.treemapWithMetricViewByAndStackByAttribute;
            const { viewByAttribute, stackByAttribute } = getMVSTreemap(dv);

            const tooltipFn = buildTooltipTreemapFactory(viewByAttribute, stackByAttribute);
            const tooltip = tooltipFn(point, DEFAULT_TOOLTIP_CONTENT_WIDTH);
            expect(getValues(tooltip)).toEqual([
                "Department",
                "Direct Sales",
                "Region",
                "West Coast",
                "serie name",
                "300",
            ]);
        });

        it("should generate correct tooltip for chart with small width", () => {
            const chartConfig: IChartConfig = {
                type: "treemap",
            };
            const dv = fixtures.treemapWithMetricViewByAndStackByAttribute;
            const { viewByAttribute, stackByAttribute } = getMVSTreemap(dv);

            const tooltipFn = buildTooltipTreemapFactory(viewByAttribute, stackByAttribute, chartConfig);
            const tooltip = tooltipFn(pointForSmallCharts, SMALL_TOOLTIP_CONTENT_WIDTH);
            expect(getStyleMaxWidth(tooltip)).toEqual([
                "180",
                "180",
                "180",
                "180",
                "180",
                "180",
                "180",
                "180",
                "180",
                "180",
                "180",
                "180",
            ]);
        });
    });

    describe("getChartOptions", () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;
        const chartOptionsWithCustomOptions = generateChartOptions(dataSet, {
            xLabel: "xLabel",
            yLabel: "yLabel",
            yFormat: "yFormat",
            type: "line",
            legendLayout: "vertical",
        });

        it("should throw if measure group is missing in dimensions", () => {
            expect(generateChartOptions.bind(this, emptyDataView)).toThrow();
        });

        it("should throw if chart type is of unknown type", () => {
            expect(generateChartOptions.bind(this, emptyDataView, { type: "bs" })).toThrow();
        });

        it("should assign custom legend format", () => {
            expect(chartOptionsWithCustomOptions.legendLayout).toBe("vertical");
        });

        it("should enable grid", () => {
            expect(chartOptionsWithCustomOptions.grid.enabled).toBe(true);
        });

        it("should disable grid", () => {
            const chartOptions = generateChartOptions(dataSet, { grid: { enabled: false }, type: "line" });
            expect(chartOptions.grid.enabled).toEqual(false);
        });

        describe("getCategoriesForTwoAttributes", () => {
            const chartOptions = generateChartOptions(fixtures.barChartWith4MetricsAndViewByTwoAttributes);

            it("should assign two-level categories", () => {
                expect(chartOptions.data.categories).toEqual([
                    {
                        categories: ["East Coast", "West Coast"],
                        name: "Direct Sales",
                    },
                    {
                        categories: ["East Coast", "West Coast"],
                        name: "Inside Sales",
                    },
                ]);
            });

            it('should turn on "isViewByTwoAttributes"', () => {
                expect(chartOptions.isViewByTwoAttributes).toBeTruthy();
            });

            it('should turn off "isViewByTwoAttributes"', () => {
                const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute);
                expect(chartOptions.isViewByTwoAttributes).toBeFalsy();
            });
        });

        describe("in usecase of bar chart with 3 metrics", () => {
            const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute);

            it("should assign a default legend format of horizontal", () => {
                expect(chartOptions.legendLayout).toBe("horizontal");
            });

            it("should assign stacking option to null", () => {
                expect(chartOptions.stacking).toBe(null);
            });

            it("should assign number of series equal to number of measures", () => {
                expect(chartOptions.data.series.length).toBe(3);
            });

            it("should assign categories equal to view by attribute values", () => {
                expect(chartOptions.data.categories).toEqual([
                    "<button>2008</button>",
                    "2009",
                    "2010",
                    "2011",
                    "2012",
                ]);
            });

            it("should assign 3 colors from default colorPalette", () => {
                const seriesColors = chartOptions.data.series.map((serie: any) => serie.color);
                expect(seriesColors).toEqual(
                    DefaultColorPalette.slice(0, 3).map((defaultColor: IColorPaletteItem) =>
                        getRgbString(defaultColor),
                    ),
                );
            });

            it("should assign correct tooltip function", () => {
                const { viewByAttribute } = getMVS(dataSet);
                const pointData: IUnsafeHighchartsTooltipPoint = {
                    y: 1,
                    format: "# ###",
                    name: "point",
                    category: {
                        name: "category",
                    },
                    series: {
                        name: "series",
                    },
                };
                const tooltip = chartOptions.actions.tooltip(pointData, DEFAULT_TOOLTIP_CONTENT_WIDTH);
                const expectedTooltip = buildTooltipFactory(viewByAttribute, "column")(
                    pointData,
                    DEFAULT_TOOLTIP_CONTENT_WIDTH,
                );
                expect(tooltip).toBe(expectedTooltip);
            });
        });

        describe("in usecase of stack bar chart", () => {
            const chartOptions = generateChartOptions(fixtures.barChartWithStackByAndViewByAttributes);

            it("should assign stacking normal", () => {
                expect(chartOptions.stacking).toBe("normal");
            });

            it("should assign number of series equal to number of stack by attribute values", () => {
                expect(chartOptions.data.series.length).toBe(2);
            });

            it("should assign categories equal to view by attribute values", () => {
                expect(chartOptions.data.categories).toEqual(["Direct Sales", "Inside Sales"]);
            });

            it("should assign correct tooltip function", () => {
                const { viewByAttribute, stackByAttribute } = getMVS(
                    fixtures.barChartWithStackByAndViewByAttributes,
                );
                const pointData: IUnsafeHighchartsTooltipPoint = {
                    y: 1,
                    format: "# ###",
                    name: "point",
                    category: {
                        name: "category",
                    },
                    series: {
                        name: "series",
                    },
                };
                let measure: IMeasureDescriptor;
                const tooltip = chartOptions.actions.tooltip(pointData, DEFAULT_TOOLTIP_CONTENT_WIDTH);
                const expectedTooltip = buildTooltipFactory(
                    viewByAttribute,
                    "column",
                    {},
                    false,
                    measure,
                    stackByAttribute,
                )(pointData, DEFAULT_TOOLTIP_CONTENT_WIDTH);
                expect(tooltip).toBe(expectedTooltip);
            });
        });

        describe("in usecase of pie chart and treemap with attribute", () => {
            const pieChartOptions = generateChartOptions(fixtures.barChartWithViewByAttribute, {
                type: "pie",
            });
            const treemapOptions = generateChartOptions(fixtures.treemapWithMetricAndViewByAttribute, {
                type: "treemap",
            });

            it("should assign stacking normal", () => {
                expect(pieChartOptions.stacking).toBe(null);
                expect(treemapOptions.stacking).toBe(null);
            });

            it("should always assign 1 series", () => {
                expect(pieChartOptions.data.series.length).toBe(1);
                expect(treemapOptions.data.series.length).toBe(1);
            });

            it("should assign categories equal to view by attribute values", () => {
                expect(pieChartOptions.data.categories).toEqual(["Direct Sales", "Inside Sales"]);
                expect(treemapOptions.data.categories).toEqual(["Direct Sales", "Inside Sales"]);
            });

            it("should assign correct tooltip function", () => {
                const { viewByAttribute } = getMVS(fixtures.barChartWithStackByAndViewByAttributes);
                const pointData: IUnsafeHighchartsTooltipPoint = {
                    node: {
                        isLeaf: true,
                    },
                    x: 0,
                    y: 1,
                    format: "# ###",
                    name: "point",
                    category: {
                        name: "category",
                    },
                    series: {
                        name: "series",
                    },
                };

                let expectedTooltip = buildTooltipFactory(viewByAttribute, "column")(
                    pointData,
                    DEFAULT_TOOLTIP_CONTENT_WIDTH,
                );

                const pieChartTooltip = pieChartOptions.actions.tooltip(
                    pointData,
                    DEFAULT_TOOLTIP_CONTENT_WIDTH,
                );
                expect(pieChartTooltip).toBe(expectedTooltip);

                expectedTooltip = buildTooltipTreemapFactory(viewByAttribute, null)(
                    pointData,
                    DEFAULT_TOOLTIP_CONTENT_WIDTH,
                );

                const treemapTooltip = treemapOptions.actions.tooltip(
                    pointData,
                    DEFAULT_TOOLTIP_CONTENT_WIDTH,
                );
                expect(treemapTooltip).toBe(expectedTooltip);
            });
        });

        describe("in usecase of pie chart and treemap with measures only", () => {
            const pieChartOptions = generateChartOptions(fixtures.pieChartWithMetricsOnly, { type: "pie" });
            const treemapOptions = generateChartOptions(fixtures.pieChartWithMetricsOnly, {
                type: "treemap",
            });

            it("should assign stacking normal", () => {
                expect(pieChartOptions.stacking).toBe(null);
                expect(treemapOptions.stacking).toBe(null);
            });

            it("should always assign 1 series", () => {
                expect(pieChartOptions.data.series.length).toBe(1);
                expect(treemapOptions.data.series.length).toBe(1);
            });

            it("should assign categories with names of measures", () => {
                expect(pieChartOptions.data.categories).toEqual(["Won", "Lost", "Expected"]);
                expect(treemapOptions.data.categories).toEqual(["Lost", "Won", "Expected"]);
            });

            it("should assign correct tooltip function", () => {
                const pointData: IUnsafeHighchartsTooltipPoint = {
                    node: {
                        isLeaf: true,
                    },
                    y: 1,
                    format: "# ###",
                    name: "point",
                    category: {
                        name: "category",
                    },
                    series: {
                        name: "series",
                    },
                    value: 2,
                };

                const expectedPieChartTooltip = buildTooltipFactory(null, "pie")(
                    pointData,
                    DEFAULT_TOOLTIP_CONTENT_WIDTH,
                );
                const pieChartTooltip = pieChartOptions.actions.tooltip(
                    pointData,
                    DEFAULT_TOOLTIP_CONTENT_WIDTH,
                );
                expect(pieChartTooltip).toBe(expectedPieChartTooltip);

                const expectedTreemapTooltip = buildTooltipTreemapFactory(null, null)(
                    pointData,
                    DEFAULT_TOOLTIP_CONTENT_WIDTH,
                );
                const treemapTooltip = treemapOptions.actions.tooltip(
                    pointData,
                    DEFAULT_TOOLTIP_CONTENT_WIDTH,
                );
                expect(treemapTooltip).toBe(expectedTreemapTooltip);
            });
        });

        describe("in usecase of bar chart with pop measure", () => {
            const chartOptions = generateChartOptions(fixtures.barChartWithPopMeasureAndViewByAttribute, {
                type: "column",
            });

            it("should assign stacking normal", () => {
                expect(chartOptions.stacking).toBe(null);
            });

            it("should always assign number of series equal to number of measures", () => {
                expect(chartOptions.data.series.length).toBe(2);
            });

            it("should assign categories ", () => {
                expect(chartOptions.data.categories).toEqual([
                    "2008",
                    "2009",
                    "2010",
                    "2011",
                    "2012",
                    "2013",
                ]);
            });

            it("should assign updated color for pop measure", () => {
                expect(chartOptions.data.series[0].color).toEqual("rgb(161,224,243)");
                expect(chartOptions.data.series[1].color).toEqual("rgb(20,178,226)");
            });

            it("should assign correct tooltip function for pop measure", () => {
                const { viewByAttribute } = getMVS(fixtures.barChartWithPopMeasureAndViewByAttribute);
                const pointData: IUnsafeHighchartsTooltipPoint = {
                    y: 1,
                    format: "# ###",
                    name: "point",
                    category: {
                        name: "category",
                    },
                    series: {
                        name: "series",
                    },
                };
                const tooltip = chartOptions.actions.tooltip(pointData, DEFAULT_TOOLTIP_CONTENT_WIDTH);
                const expectedTooltip = buildTooltipFactory(viewByAttribute, "column")(
                    pointData,
                    DEFAULT_TOOLTIP_CONTENT_WIDTH,
                );
                expect(tooltip).toBe(expectedTooltip);
            });

            it("should assign correct tooltip function for previous period measure", () => {
                const { viewByAttribute } = getMVS(fixtures.barChartWithPreviousPeriodMeasure);
                const pointData = {
                    y: 1,
                    format: "# ###",
                    name: "point",
                    category: {
                        name: "category",
                    },
                    series: {
                        name: "series",
                    },
                };
                const tooltip = chartOptions.actions.tooltip(pointData, DEFAULT_TOOLTIP_CONTENT_WIDTH);
                const expectedTooltip = buildTooltipFactory(viewByAttribute, "column")(
                    pointData,
                    DEFAULT_TOOLTIP_CONTENT_WIDTH,
                );
                expect(tooltip).toBe(expectedTooltip);
            });
        });

        describe("in usecase of stacked area chart", () => {
            it("should assign stacking normal", () => {
                const chartOptions = generateChartOptions(fixtures.areaChartWith3MetricsAndViewByAttribute, {
                    type: "area",
                });
                expect(chartOptions.stacking).toBe("normal");
            });

            it("should disable stacking by config", () => {
                const chartOptions = generateChartOptions(fixtures.areaChartWith3MetricsAndViewByAttribute, {
                    type: "area",
                    stacking: false,
                });

                expect(chartOptions.stacking).toBeNull();
            });

            it("should enable stacking by config", () => {
                const chartOptions = generateChartOptions(fixtures.areaChartWith3MetricsAndViewByAttribute, {
                    type: "area",
                    stacking: true,
                });

                expect(chartOptions.stacking).toBe("normal");
            });

            it("should disable stacking by config even with stack by attribute", () => {
                const chartOptions = generateChartOptions(fixtures.areaChartWithMeasureViewByAndStackBy, {
                    type: "area",
                    stacking: false,
                });

                expect(chartOptions.stacking).toBeNull();
            });
        });

        describe("in usecase of combo chart", () => {
            it("should assign `line` type to second series according mbObject", () => {
                const chartOptions = generateChartOptions(fixtures.comboWithTwoMeasuresAndViewByAttribute, {
                    type: COMBO,
                });

                expect(chartOptions.data.series[0].type).toBe(COLUMN);
                expect(chartOptions.data.series[1].type).toBe(LINE);
            });

            it("should handle missing buckets", () => {
                const chartOptions = generateChartOptions(
                    fixtures.comboChartWithTwoMeasuresViewByAttributeNoBuckets,
                    {
                        type: COMBO,
                    },
                );

                expect(chartOptions.data.series[0].type).toBeUndefined();
                expect(chartOptions.data.series[1].type).toBeUndefined();
            });

            it.each([
                [null, false],
                ["normal", true],
            ])(
                "should return %s when column+line chart is single axis and 'Stack Measures' is %s",
                (stackingValue: StackingType, stackMeasures: boolean) => {
                    const chartOptions = generateChartOptions(
                        fixtures.comboWithTwoMeasuresAndViewByAttribute,
                        {
                            type: COMBO,
                            stackMeasuresToPercent: true,
                            dualAxis: false,
                            stackMeasures,
                        },
                    );

                    expect(chartOptions.stacking).toBe(stackingValue);
                },
            );

            it.each([
                ["percent", { stackMeasuresToPercent: true }],
                ["normal", { stackMeasures: true }],
            ])(
                "should return %s when column+line chart is dual axis",
                (stacking: StackingType, stackingConfig: any) => {
                    const chartOptions = generateChartOptions(
                        fixtures.comboWithTwoMeasuresAndViewByAttribute,
                        {
                            type: COMBO,
                            secondary_yaxis: {
                                measures: ["wonMetric"],
                            },
                            ...stackingConfig,
                        },
                    );

                    expect(chartOptions.stacking).toBe(stacking);
                },
            );
        });

        describe("generate Y axes", () => {
            it("should generate one axis with no label when there are more measures and in bar chart", () => {
                const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute);
                const expectedAxes = [
                    {
                        label: "",
                        format: "#,##0.00",
                        seriesIndices: [0, 1, 2],
                    },
                ];
                expect(chartOptions.yAxes).toEqual(expectedAxes);
            });

            it("should generate one axis with first measure label when there is one measure and in bar chart", () => {
                const chartOptions = generateChartOptions(fixtures.barChartWithSingleMeasureAndNoAttributes);
                const expectedAxes = [
                    {
                        label: "Amount",
                        format: "#,##0.00",
                        seriesIndices: [0],
                    },
                ];
                expect(chartOptions.yAxes).toEqual(expectedAxes);
            });
        });

        describe("generate X axes", () => {
            it("should generate one axis with attribute label", () => {
                const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute);
                const expectedAxes = [
                    {
                        label: "Year created",
                    },
                ];
                expect(chartOptions.xAxes).toEqual(expectedAxes);
            });

            it("should generate one axis with no label if primary measures are empty for scatter plot", () => {
                const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute, {
                    type: "scatter",
                    mdObject: {
                        buckets: [
                            { localIdentifier: "measures", items: [] },
                            { localIdentifier: "secondary_measures", items: [{}] },
                        ],
                    },
                });
                const expectedAxes = [
                    {
                        label: "",
                    },
                ];

                expect(chartOptions.xAxes).toEqual(expectedAxes);
            });

            it("should generate one axis with label from primary measures for scatter plot", () => {
                const chartOptions = generateChartOptions(
                    fixtures.scatterPlotWith2MetricsAndAttributeWithPrimary,
                    {
                        type: "scatter",
                    },
                );
                const expectedAxes = [
                    {
                        label: "Sum of Amount",
                        format: "#,##0.00",
                    },
                ];

                expect(chartOptions.xAxes).toEqual(expectedAxes);
            });

            it("should generate one axis with no label if primary measures are empty for bubble chart", () => {
                const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute, {
                    type: "bubble",
                });
                const expectedAxes = [
                    {
                        label: "",
                    },
                ];

                expect(chartOptions.xAxes).toEqual(expectedAxes);
            });

            it("should generate one axis with label from primary measure for bubble chart", () => {
                const chartOptions = generateChartOptions(fixtures.bubbleChartWith1Metric, {
                    type: "bubble",
                });
                const expectedAxes = [
                    {
                        label: "_Snapshot [EOP-2]",
                        format: "#,##0.00",
                    },
                ];

                expect(chartOptions.xAxes).toEqual(expectedAxes);
            });

            it("should generate joined label when chart config 'enableJoinedAttributeAxisName' is true", () => {
                const chartOptions = generateChartOptions(
                    fixtures.barChartWith4MetricsAndViewByTwoAttributes,
                    {
                        type: "bar",
                        enableJoinedAttributeAxisName: true,
                    },
                );
                const expectedAxes = [
                    {
                        label: "Department \u203a Region",
                    },
                ];

                expect(chartOptions.xAxes).toEqual(expectedAxes);
            });
        });

        describe("Bubble chart configuration", () => {
            it("Should generate series from attribute elements", () => {
                const chartOptions = generateChartOptions(fixtures.bubbleChartWith3MetricsAndAttribute, {
                    type: "bubble",
                });

                expect(chartOptions.data.series.length).toEqual(20);
            });

            it("should flip axis if primary measure bucket is empty", () => {
                const chartOptions = generateChartOptions(
                    fixtures.bubbleChartWith2MetricsAndAttributeNoPrimaries,
                    {
                        type: "bubble",
                    },
                );

                expect(chartOptions.data.series[0].data[0].x).toEqual(0);
            });

            it("Should generate correct axes", () => {
                const chartOptions = generateChartOptions(fixtures.bubbleChartWith3MetricsAndAttribute, {
                    type: "bubble",
                });

                expect(chartOptions.xAxes.length).toEqual(1);
                expect(chartOptions.yAxes.length).toEqual(1);
                expect(chartOptions.xAxes[0].label).toEqual("_Snapshot [EOP-2]");
                expect(chartOptions.yAxes[0].label).toEqual("# of Open Opps.");
            });
        });

        describe("Heatmap configuration", () => {
            describe("generateTooltipHeatmapFn", () => {
                const viewBy: IUnwrappedAttributeHeadersWithItems = {
                    uri: "",
                    identifier: "",
                    localIdentifier: "",
                    ref: idRef(""),
                    name: "viewBy",
                    formOf: {
                        ref: idRef(""),
                        uri: "",
                        identifier: "",
                        name: "viewAttr",
                    },
                    items: [
                        {
                            attributeHeaderItem: {
                                uri: "",
                                name: "viewHeader",
                            },
                        },
                    ],
                };

                const stackBy: IUnwrappedAttributeHeadersWithItems = {
                    uri: "",
                    identifier: "",
                    localIdentifier: "",
                    ref: idRef(""),
                    name: "stackBy",
                    formOf: {
                        ref: idRef(""),
                        uri: "",
                        identifier: "",
                        name: "stackAttr",
                    },
                    items: [
                        {
                            attributeHeaderItem: {
                                uri: "",
                                name: "stackHeader",
                            },
                        },
                    ],
                };

                const point = {
                    value: 300,
                    x: 0,
                    y: 0,
                    series: {
                        name: "name",
                        userOptions: {
                            dataLabels: {
                                formatGD: "abcd",
                            },
                        },
                    },
                };

                it("should generate correct tooltip", () => {
                    const tooltipFn = generateTooltipHeatmapFn(viewBy, stackBy);
                    const tooltip = tooltipFn(point, DEFAULT_TOOLTIP_CONTENT_WIDTH);

                    expect(getValues(tooltip)).toEqual([
                        "stackAttr",
                        "stackHeader",
                        "viewAttr",
                        "viewHeader",
                        "name",
                        "abcd",
                    ]);
                });

                it("should generate correct tooltip for chart with small width", () => {
                    const chartConfig: IChartConfig = {
                        type: "heatmap",
                    };
                    const tooltipFn = generateTooltipHeatmapFn(viewBy, stackBy, chartConfig);
                    const tooltip = tooltipFn(pointForSmallCharts, SMALL_TOOLTIP_CONTENT_WIDTH);

                    expect(getStyleMaxWidth(tooltip)).toEqual([
                        "180",
                        "180",
                        "180",
                        "180",
                        "180",
                        "180",
                        "180",
                        "180",
                        "180",
                        "180",
                        "180",
                        "180",
                    ]);
                });

                it('should display "-" for null value', () => {
                    const tooltipValue = generateTooltipHeatmapFn(viewBy, stackBy)(
                        {
                            ...point,
                            value: null,
                        },
                        DEFAULT_TOOLTIP_CONTENT_WIDTH,
                    );

                    expect(getValues(tooltipValue)).toEqual([
                        "stackAttr",
                        "stackHeader",
                        "viewAttr",
                        "viewHeader",
                        "name",
                        "-",
                    ]);
                });
            });

            describe("getChartOptions for heatmap", () => {
                it("should generate correct series with enabled data labels", () => {
                    const chartOptions = generateChartOptions(
                        fixtures.barChartWithStackByAndViewByAttributes,
                        {
                            type: "heatmap",
                            stacking: false,
                        },
                    );
                    const expectedSeries = [
                        {
                            data: [
                                { x: 0, y: 0, value: 21978695.46, drilldown: false },
                                { x: 1, y: 0, value: 6038400.96, drilldown: false },
                                { x: 0, y: 1, value: 58427629.5, drilldown: false },
                                { x: 1, y: 1, value: 30180730.62, drilldown: false },
                            ],
                            dataLabels: {
                                formatGD: "#,##0.00",
                            },
                            legendIndex: 0,
                            name: "Amount",
                            seriesIndex: 0,
                            turboThreshold: 0,
                            yAxis: 0,
                            isDrillable: false,
                        },
                    ];

                    expect(chartOptions.data.series).toEqual(expectedSeries);
                });

                it("should generate valid categories", () => {
                    const chartOptions = generateChartOptions(
                        fixtures.barChartWithStackByAndViewByAttributes,
                        {
                            type: "heatmap",
                            stacking: false,
                        },
                    );

                    const expectedCategories = [
                        ["Direct Sales", "Inside Sales"],
                        ["East Coast", "West Coast"],
                    ];

                    expect(chartOptions.data.categories).toEqual(expectedCategories);
                });

                it("should generate categories with empty strings", () => {
                    const chartOptions = generateChartOptions(
                        fixtures.barChartWithSingleMeasureAndNoAttributes,
                        {
                            type: "heatmap",
                            stacking: false,
                        },
                    );
                    const expectedCategories = [[""], [""]];
                    expect(chartOptions.data.categories).toEqual(expectedCategories);
                });

                it("should generate Yaxes without format from measure", () => {
                    const chartOptions = generateChartOptions(
                        fixtures.barChartWithStackByAndViewByAttributes,
                        {
                            type: "heatmap",
                        },
                    );
                    const expectedYAxis = [
                        {
                            label: "Region",
                        },
                    ];
                    expect(chartOptions.yAxes).toEqual(expectedYAxis);
                });

                it("should generate Yaxes label from attribute name", () => {
                    const chartOptions = generateChartOptions(fixtures.heatMapWithMetricRowColumn, {
                        type: "heatmap",
                    });
                    const expectedYAxis = [
                        {
                            label: "Product",
                        },
                    ];
                    expect(chartOptions.yAxes).toEqual(expectedYAxis);
                });

                describe("getHeatmapDataClasses", () => {
                    it("should return empty array when there are no values in series", () => {
                        const series = [{ data: [{ value: null as any }] }];
                        const expectedDataClasses: Highcharts.ColorAxisDataClassesOptions[] = [];
                        const dataClasses = getHeatmapDataClasses(series, {} as any as IColorStrategy);

                        expect(dataClasses).toEqual(expectedDataClasses);
                    });

                    it("should return single dataClass when series have only one value", () => {
                        const series = [
                            {
                                data: [
                                    {
                                        value: 10,
                                    },
                                ],
                            },
                        ];

                        const expectedDataClasses = [
                            {
                                from: 10,
                                to: 10,
                                color: "rgb(197,236,248)",
                            },
                        ];
                        const dataClasses = getHeatmapDataClasses(
                            series,
                            new HeatmapColorStrategy(null, null, null, null, emptyDataView),
                        );

                        expect(dataClasses).toEqual(expectedDataClasses);
                    });

                    it("should return 7 data classes with valid color", () => {
                        const series = [
                            {
                                data: [
                                    {
                                        value: 0,
                                    },
                                    {
                                        value: 20,
                                    },
                                    {
                                        value: 30,
                                    },
                                ],
                            },
                        ];
                        const approximatelyExpectedDataClasses = [
                            {
                                from: 0,
                                color: "rgb(255,255,255)",
                            },
                            {
                                color: "rgb(197,236,248)",
                            },
                            {
                                color: "rgb(138,217,241)",
                            },
                            {
                                color: "rgb(79,198,234)",
                            },
                            {
                                color: "rgb(20,178,226)",
                            },
                            {
                                color: "rgb(22,151,192)",
                            },
                            {
                                to: 30,
                                color: "rgb(0,110,145)",
                            },
                        ];
                        const dataClasses = getHeatmapDataClasses(
                            series,
                            new HeatmapColorStrategy(null, null, null, null, emptyDataView),
                        );

                        expect(dataClasses).toMatchObject(approximatelyExpectedDataClasses);
                    });
                });
            });
        });

        describe("dual axes", () => {
            const config: IChartConfig = {
                type: "column",
                secondary_yaxis: {
                    measures: ["wonMetric"],
                },
            };

            const chartOptions = generateChartOptions(
                fixtures.barChartWith3MetricsAndViewByAttribute,
                config,
            );
            it("should generate right Y axis with correct properties", () => {
                const expectedAxes = [
                    {
                        label: "", // axis label must be empty with 2 metrics
                        format: "#,##0.00",
                        opposite: false,
                        seriesIndices: [0, 2],
                    },
                    {
                        label: "Won", // axis label must present with 1 metric
                        format: "#,##0.00",
                        opposite: true,
                        seriesIndices: [1],
                    },
                ];
                expect(chartOptions.yAxes).toEqual(expectedAxes);
            });

            it("should generate right y series with correct yAxis value", () => {
                const expectedYAxisValues = [0, 1, 0]; // Left: Lost, Expected and Right: Won
                const yAxisValues = chartOptions.data.series.map(({ yAxis }: any) => yAxis);
                expect(yAxisValues).toEqual(expectedYAxisValues);
            });

            it("should generate % format for both Y axes ", () => {
                const dv = fixtures.barChartWith3MetricsAndViewByAttributeFunformat;
                const chartOptions = generateChartOptions(dv, config);
                const formatValues = chartOptions.yAxes.map(({ format }: any) => format);
                expect(formatValues).toEqual(["#,##0.00%", "#,##0.00%"]);
            });

            it("should generate % format for right Y axis ", () => {
                const dv = fixtures.barChartWith3MetricsAndViewByAttributePercInFormat;
                const chartOptions = generateChartOptions(dv, config);
                const formatValues = chartOptions.yAxes.map(({ format }: any) => format);
                expect(formatValues).toEqual(["#,##0.00", "#,##0.00%"]);
            });

            it("should generate one right Y axis", () => {
                const config = {
                    type: "column",
                    secondary_yaxis: {
                        measures: ["lostMetric", "expectedMetric", "wonMetric"],
                    },
                };
                const chartOptions = generateChartOptions(
                    fixtures.barChartWith3MetricsAndViewByAttribute,
                    config,
                );

                const expectedAxis = [
                    {
                        label: "", // axis label must be empty with 3 metrics
                        format: "#,##0.00",
                        opposite: true,
                        seriesIndices: [0, 1, 2],
                    },
                ];
                expect(chartOptions.yAxes).toEqual(expectedAxis);
            });

            it("should return number values in tooltip when point is on secondary axis", () => {
                const newConfig = cloneDeep(config);
                newConfig.stackMeasuresToPercent = true;

                const {
                    actions: { tooltip: tooltipFn },
                } = generateChartOptions(dataSet, newConfig);

                const pointDataForDualAxes = {
                    y: 1,
                    format: "# ###",
                    name: "point",
                    category: {
                        name: "category",
                        parent: {
                            name: "parent category",
                        },
                    },
                    series: {
                        name: "series",
                        yAxis: {
                            opposite: true,
                        },
                    },
                };

                const tooltip = tooltipFn(pointDataForDualAxes, DEFAULT_TOOLTIP_CONTENT_WIDTH, 49.011);
                expect(getValues(tooltip)).toEqual(["Year created", "category", "series", " 1"]);
            });
        });

        describe("optional stacking", () => {
            const pointDataForTwoAttributes: IUnsafeHighchartsTooltipPoint = {
                y: 1,
                format: "# ###",
                name: "point",
                category: {
                    name: "category",
                    parent: {
                        name: "parent category",
                        leaves: 3,
                        categories: [],
                    },
                },
                series: {
                    name: "series",
                },
            };

            it("should return grouped categories with viewing by 2 attributes", () => {
                const {
                    data: { categories },
                    isViewByTwoAttributes,
                } = generateChartOptions(fixtures.barChartWith4MetricsAndViewByTwoAttributes);

                expect(isViewByTwoAttributes).toBeTruthy();
                expect(categories).toEqual([
                    {
                        name: "Direct Sales",
                        categories: ["East Coast", "West Coast"],
                    },
                    {
                        name: "Inside Sales",
                        categories: ["East Coast", "West Coast"],
                    },
                ]);
            });

            it("should not return grouped categories with viewing by one attribute", () => {
                const {
                    data: { categories },
                    isViewByTwoAttributes,
                } = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute);

                expect(isViewByTwoAttributes).toBeFalsy();
                expect(categories).toEqual(["<button>2008</button>", "2009", "2010", "2011", "2012"]);
            });

            it("should return full information in tooltip with viewing by 2 attributes", () => {
                const {
                    actions: { tooltip: tooltipFn },
                } = generateChartOptions(fixtures.barChartWith4MetricsAndViewByTwoAttributes);

                const tooltip = tooltipFn(pointDataForTwoAttributes, DEFAULT_TOOLTIP_CONTENT_WIDTH);
                expect(getValues(tooltip)).toEqual([
                    "Department",
                    "parent category",
                    "Region",
                    "category",
                    "series",
                    " 1",
                ]);
            });

            it("should return percentage values in tooltip when stackMeasuresToPercent is true", () => {
                const {
                    actions: { tooltip: tooltipFn },
                } = generateChartOptions(fixtures.barChartWith4MetricsAndViewByTwoAttributes, {
                    stackMeasuresToPercent: true,
                    type: COLUMN,
                });

                const tooltip = tooltipFn(pointDataForTwoAttributes, DEFAULT_TOOLTIP_CONTENT_WIDTH, 49.011);
                expect(getValues(tooltip)).toEqual([
                    "Department",
                    "parent category",
                    "Region",
                    "category",
                    "series",
                    "49.01%",
                ]);
            });

            it.each`
                description    | config
                ${"undefined"} | ${undefined}
                ${"false"}     | ${{ stackMeasures: false, stackMeasuresToPercent: false }}
            `(
                "should return 'undefined' stacking with stack options are $description",
                ({ config }: { config: any }) => {
                    const { stacking } = generateChartOptions(
                        fixtures.barChartWith3MetricsAndViewByAttribute,
                        {
                            type: COLUMN,
                            ...config,
                        },
                    );
                    expect(stacking).toBeFalsy();
                },
            );
        });
    });
});
