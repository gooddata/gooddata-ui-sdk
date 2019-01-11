// (C) 2007-2018 GoodData Corporation
import range = require('lodash/range');
import get = require('lodash/get');
import cloneDeep = require('lodash/cloneDeep');
import { Execution } from '@gooddata/typings';
import { findMeasureGroupInDimensions } from '../../../../helpers/executionResultHelper';
import { immutableSet } from '../../utils/common';
import {
    isNegativeValueIncluded,
    validateData,
    getSeriesItemData,
    getSeries,
    getDrillIntersection,
    getDrillableSeries,
    customEscape,
    generateTooltipFn,
    generateTooltipHeatmapFn,
    generateTooltipXYFn,
    generateTooltipTreemapFn,
    IPoint,
    getBubbleChartSeries,
    getHeatmapDataClasses,
    getTreemapAttributes,
    isDerivedMeasure,
    getCategoriesForTwoAttributes,
    getDistinctAttributeHeaderName,
    IUnwrappedAttributeHeadersWithItems,
    IViewByTwoAttributes
} from '../chartOptionsBuilder';
import { DEFAULT_CATEGORIES_LIMIT } from '../highcharts/commonConfiguration';
import { generateChartOptions, getMVS } from './helper';

import * as headerPredicateFactory from '../../../../factory/HeaderPredicateFactory';
import * as fixtures from '../../../../../stories/test_data/fixtures';

import {
    PIE_CHART_LIMIT,
    STACK_BY_DIMENSION_INDEX
} from '../constants';

import {
    DEFAULT_COLOR_PALETTE,
    getLighterColor,
    getRgbString
} from '../../utils/color';

import {
    TreemapColorStrategy,
    MeasureColorStrategy,
    AttributeColorStrategy,
    BubbleChartColorStrategy,
    HeatmapColorStrategy,
    IColorStrategy
} from '../colorFactory';
import { IColorPaletteItem } from '../../../../interfaces/Config';
import { NORMAL_STACK, PERCENT_STACK } from '../highcharts/getOptionalStackingConfiguration';
import { VisualizationTypes } from '../../../..';

export { IPoint };

const FIRST_DEFAULT_COLOR_ITEM_AS_STRING = getRgbString(DEFAULT_COLOR_PALETTE[0]);
const SECOND_DEFAULT_COLOR_ITEM_AS_STRING = getRgbString(DEFAULT_COLOR_PALETTE[1]);

function getMVSTreemap(dataSet: any) {
    const {
        executionResponse: { dimensions },
        executionResult: { headerItems },
        mdObject
    } = dataSet;
    const measureGroup = findMeasureGroupInDimensions(dimensions);
    const {
        viewByAttribute,
        stackByAttribute
    } = getTreemapAttributes(
        dimensions,
        headerItems,
        mdObject
    );

    return {
        measureGroup,
        viewByAttribute,
        stackByAttribute
    };
}

function getSeriesItemDataParameters(dataSet: any, seriesIndex: any) {
    const seriesItem = dataSet.executionResult.data[seriesIndex];
    const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dataSet);
    return [
        seriesItem,
        seriesIndex,
        measureGroup,
        viewByAttribute,
        stackByAttribute
    ];
}

describe('chartOptionsBuilder', () => {
    const barChartWithStackByAndViewByAttributesOptions = generateChartOptions();

    const barChartWith3MetricsAndViewByAttributeOptions =
        generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute);

    const pieAndTreemapDataSet = {
        ...fixtures.pieChartWithMetricsOnly,
        executionResult: {
            ...fixtures.pieChartWithMetricsOnly.executionResult,
            data: [
                [
                    '-1',
                    '38310753.45',
                    '9011389.956'
                ]
            ]
        }
    };

    const pieChartOptionsWithNegativeValue = generateChartOptions(pieAndTreemapDataSet, { type: 'pie' });

    const treemapOptionsWithNegativeValue = generateChartOptions(pieAndTreemapDataSet, { type: 'treemap' });

    const pieChartWithMetricsOnlyOptions: any = generateChartOptions({
        ...fixtures.pieChartWithMetricsOnly
    },
    {
        type: 'pie'
    });

    describe('isNegativeValueIncluded', () => {
        it('should return true if there is at least one negative value in series', () => {
            expect(
                isNegativeValueIncluded(pieChartOptionsWithNegativeValue.data.series)
            ).toBe(true);
        });
        it('should return false if there are no negative values in series', () => {
            expect(
                isNegativeValueIncluded(pieChartWithMetricsOnlyOptions.data.series)
            ).toBe(false);
        });
    });

    describe('validateData', () => {
        describe('user supplied limits', () => {
            it('should validate with "dataTooLarge: true" against series limit', () => {
                const validationResult = validateData({
                    series: 1
                }, barChartWith3MetricsAndViewByAttributeOptions);

                expect(
                    validationResult
                ).toEqual({
                    dataTooLarge: true,
                    hasNegativeValue: false
                });
            });
            it('should validate with "dataTooLarge: true" against categories limit', () => {
                const validationResult = validateData({
                    categories: 1
                }, barChartWith3MetricsAndViewByAttributeOptions);

                expect(
                    validationResult
                ).toEqual({
                    dataTooLarge: true,
                    hasNegativeValue: false
                });
            });
        });

        describe('default limits', () => {
            it('should be able to validate successfuly', () => {
                const chartOptions = barChartWithStackByAndViewByAttributesOptions;
                const validationResult = validateData(undefined, chartOptions);

                expect(
                    validationResult
                ).toEqual({
                    dataTooLarge: false,
                    hasNegativeValue: false
                });
            });
            it('should validate with "dataTooLarge: true" against default chart categories limit ' +
                `of ${DEFAULT_CATEGORIES_LIMIT}`, () => {
                const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute);
                chartOptions.data.categories = range(DEFAULT_CATEGORIES_LIMIT + 1);

                const validationResult = validateData(undefined, chartOptions);

                expect(
                    validationResult
                ).toEqual({
                    dataTooLarge: true,
                    hasNegativeValue: false
                });
            });

            it('should validate with "dataTooLarge: true" against default pie chart series limit of 1', () => {
                const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute,
                    {
                        type: 'pie'
                    });
                const validationResult = validateData(undefined, chartOptions);

                expect(
                    validationResult
                ).toEqual({
                    dataTooLarge: true,
                    hasNegativeValue: false
                });
            });

            it('should validate with "dataTooLarge: true" against default' +
                `pie chart categories limit of ${PIE_CHART_LIMIT}`, () => {
                const chartOptions = generateChartOptions(fixtures.pieChartWithMetricsOnly,
                    {
                        type: 'pie'
                    });
                chartOptions.data.categories = range(PIE_CHART_LIMIT + 1);
                const validationResult = validateData(undefined, chartOptions);

                expect(
                    validationResult
                ).toEqual({
                    dataTooLarge: true,
                    hasNegativeValue: false
                });
            });
            it('should validate with "hasNegativeValue: true" for pie chart if its series contains a negative value',
                () => {
                const chartOptions = pieChartOptionsWithNegativeValue;
                const validationResult = validateData(undefined, chartOptions);

                expect(
                    validationResult
                ).toEqual({
                    dataTooLarge: false,
                    hasNegativeValue: true
                });
            });
            it('should validate with "hasNegativeValue: true" for treemap if its series contains a negative value',
                () => {
                    const validationResult = validateData(undefined, treemapOptionsWithNegativeValue);
                    expect(validationResult).toEqual({
                        dataTooLarge: false,
                        hasNegativeValue: true
                    });
                });
        });

        describe('Treemap filters out root nodes for dataPoints limit', () => {
            it('should validate with "dataTooLarge: false" against data points limit', () => {
                // 2 roots + 4 leafs
                const treemapOptions = generateChartOptions(
                    fixtures.treemapWithMetricViewByAndStackByAttribute,
                    {
                        type: 'treemap',
                        mdObject: fixtures.treemapWithMetricViewByAndStackByAttribute.mdObject
                    }
                );
                const validationResult = validateData({
                    dataPoints: 4
                }, treemapOptions);

                expect(
                    validationResult
                ).toEqual({
                    dataTooLarge: false,
                    hasNegativeValue: false
                });
            });

            it('should validate with "dataTooLarge: true" against data points limit', () => {
                // 2 roots + 4 leafs
                const treemapOptions = generateChartOptions(
                    fixtures.treemapWithMetricViewByAndStackByAttribute,
                    {
                        type: 'treemap',
                        mdObject: fixtures.treemapWithMetricViewByAndStackByAttribute.mdObject
                    }
                );
                const validationResult = validateData({
                    dataPoints: 3
                }, treemapOptions);

                expect(
                    validationResult
                ).toEqual({
                    dataTooLarge: true,
                    hasNegativeValue: false
                });
            });
        });
    });

    describe('isDerivedMeasure', () => {
        it('should return true if measureItem was defined as a popMeasure', () => {
            const measureItem = fixtures
                .barChartWithPopMeasureAndViewByAttribute
                .executionResponse
                .dimensions[STACK_BY_DIMENSION_INDEX]
                .headers[0]
                .measureGroupHeader
                .items[0];
            const { afm } = fixtures.barChartWithPopMeasureAndViewByAttribute.executionRequest;
            expect(
                isDerivedMeasure(measureItem, afm)
            ).toEqual(true);
        });

        it('should return true if measureItem was defined as a previousPeriodMeasure', () => {
            const measureItem = fixtures
                .barChartWithPreviousPeriodMeasure
                .executionResponse
                .dimensions[STACK_BY_DIMENSION_INDEX]
                .headers[0]
                .measureGroupHeader
                .items[0];
            const { afm } = fixtures.barChartWithPreviousPeriodMeasure.executionRequest;
            expect(
                isDerivedMeasure(measureItem, afm)
            ).toEqual(true);
        });

        it('should return false if measureItem was defined as a simple measure', () => {
            const measureItem = fixtures
                .barChartWithPopMeasureAndViewByAttribute
                .executionResponse
                .dimensions[STACK_BY_DIMENSION_INDEX]
                .headers[0]
                .measureGroupHeader
                .items[1];
            const { afm } = fixtures.barChartWithPopMeasureAndViewByAttribute.executionRequest;

            expect(
                isDerivedMeasure(measureItem, afm)
            ).toEqual(false);
        });
    });

    describe('getSeriesItemData', () => {
        describe('in usecase of bar chart with pop measure and view by attribute', () => {
            const parameters = getSeriesItemDataParameters(fixtures.barChartWithPopMeasureAndViewByAttribute, 0);
            const seriesItem = parameters[0];
            const seriesIndex = parameters[1];
            const measureGroup = parameters[2];
            const viewByAttribute = parameters[3];
            const stackByAttribute = parameters[4];

            const attributeColorStrategy = new AttributeColorStrategy(
                DEFAULT_COLOR_PALETTE,
                undefined,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                fixtures.pieChartWithMetricsOnly.executionRequest.afm
            );

            const seriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                'column',
                attributeColorStrategy
            );

            it('should fill correct pointData name', () => {
                expect(
                    seriesItemData.map((pointData: any) => pointData.name)
                ).toEqual([
                    'Amount previous year',
                    'Amount previous year',
                    'Amount previous year',
                    'Amount previous year',
                    'Amount previous year',
                    'Amount previous year'
                ]);
            });

            it('should parse all pointData values', () => {
                expect(
                    seriesItemData.map((pointData: any) => pointData.y)
                ).toEqual([
                    null,
                    2773426.95,
                    8656468.2,
                    29140409.09,
                    60270072.2,
                    15785080.1
                ]);
            });

            it('should enable markers for all non-null pointData values', () => {
                expect(
                    seriesItemData.map((pointData: any) => pointData.marker.enabled)
                ).toEqual([
                    false,
                    true,
                    true,
                    true,
                    true,
                    true
                ]);
            });
        });

        describe('in usecase of bar chart with previous period measure and view by attribute', () => {
            const parameters = getSeriesItemDataParameters(fixtures.barChartWithPreviousPeriodMeasure, 0);
            const seriesItem = parameters[0];
            const seriesIndex = parameters[1];
            const measureGroup = parameters[2];
            const viewByAttribute = parameters[3];
            const stackByAttribute = parameters[4];

            const attributeColorStrategy = new AttributeColorStrategy(
                DEFAULT_COLOR_PALETTE,
                undefined,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                fixtures.pieChartWithMetricsOnly.executionRequest.afm
            );

            const seriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                'column',
                attributeColorStrategy
            );

            it('should fill correct pointData name', () => {
                expect(
                    seriesItemData.map((pointData: any) => pointData.name)
                ).toEqual([
                    'Primary measure - period ago',
                    'Primary measure - period ago'
                ]);
            });

            it('should parse all pointData values', () => {
                expect(
                    seriesItemData.map((pointData: any) => pointData.y)
                ).toEqual([
                    24000,
                    null
                ]);
            });

            it('should enable markers for all non-null pointData values', () => {
                expect(
                    seriesItemData.map((pointData: any) => pointData.marker.enabled)
                ).toEqual([
                    true,
                    false
                ]);
            });
        });

        describe('in usecase of pie chart and treemap with metrics only', () => {
            const parameters = getSeriesItemDataParameters(fixtures.pieChartWithMetricsOnly, 0);
            const seriesItem = parameters[0];
            const seriesIndex = parameters[1];
            const measureGroup = parameters[2];
            const viewByAttribute = parameters[3];
            const stackByAttribute = parameters[4];

            const metricColorStrategy = new MeasureColorStrategy(
                DEFAULT_COLOR_PALETTE,
                undefined,
                viewByAttribute,
                stackByAttribute,
                fixtures.pieChartWithMetricsOnly.executionResponse,
                fixtures.pieChartWithMetricsOnly.executionRequest.afm
            );

            const pieSeriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                'pie',
                metricColorStrategy
            );

            const treeMapColorStrategy = new TreemapColorStrategy(
                DEFAULT_COLOR_PALETTE,
                undefined,
                viewByAttribute,
                stackByAttribute,
                fixtures.pieChartWithMetricsOnly.executionResponse,
                fixtures.pieChartWithMetricsOnly.executionRequest.afm
            );

            const treemapSeriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                'treemap',
                treeMapColorStrategy
            );

            it('should fill correct pointData name', () => {
                expect(
                    pieSeriesItemData.map(pointData => pointData.name)
                ).toEqual([
                    'Lost',
                    'Won',
                    'Expected'
                ]);

                expect(
                    treemapSeriesItemData.map(pointData => pointData.name)
                ).toEqual([
                    'Lost',
                    'Won',
                    'Expected'
                ]);
            });

            it('should fill correct pointData color', () => {
                expect(
                    pieSeriesItemData.map(pointData => pointData.color)
                ).toEqual([
                    FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                    SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                    getRgbString(DEFAULT_COLOR_PALETTE[2])
                ]);

                expect(
                    treemapSeriesItemData.map(pointData => pointData.color)
                ).toEqual([
                    FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                    SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                    getRgbString(DEFAULT_COLOR_PALETTE[2])
                ]);
            });

            it('should fill correct pointData legendIndex', () => {
                expect(
                    pieSeriesItemData.map(pointData => pointData.legendIndex)
                ).toEqual([0, 1, 2]);

                expect(
                    treemapSeriesItemData.map(pointData => pointData.legendIndex)
                ).toEqual([0, 1, 2]);
            });

            it('should fill correct pointData format', () => {
                expect(
                    pieSeriesItemData.map(pointData => pointData.format)
                ).toEqual(['#,##0.00', '#,##0.00', '#,##0.00']);

                expect(
                    treemapSeriesItemData.map(pointData => pointData.format)
                ).toEqual(['#,##0.00', '#,##0.00', '#,##0.00']);
            });
        });

        describe('in usecase of pie chart with an attribute', () => {
            const parameters = getSeriesItemDataParameters(fixtures.barChartWithViewByAttribute, 0);
            const seriesItem = parameters[0];
            const seriesIndex = parameters[1];
            const measureGroup = parameters[2];
            const viewByAttribute = parameters[3];
            const stackByAttribute = parameters[4];

            const attributeColorStrategy = new AttributeColorStrategy(
                DEFAULT_COLOR_PALETTE,
                undefined,
                viewByAttribute,
                stackByAttribute,
                fixtures.pieChartWithMetricsOnly.executionResponse,
                fixtures.pieChartWithMetricsOnly.executionRequest.afm
            );

            const pieSeriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                'pie',
                attributeColorStrategy
            );

            const treeMapColorStrategy = new TreemapColorStrategy(
                DEFAULT_COLOR_PALETTE,
                undefined,
                viewByAttribute,
                stackByAttribute,
                fixtures.barChartWithViewByAttribute.executionResponse,
                fixtures.barChartWithViewByAttribute.executionRequest.afm
            );

            const treemapSeriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                'treemap',
                treeMapColorStrategy
            );

            it('should fill correct pointData name', () => {
                expect(
                    pieSeriesItemData.map(pointData => pointData.name)
                ).toEqual([
                    'Direct Sales',
                    'Inside Sales'
                ]);

                expect(
                    treemapSeriesItemData.map(pointData => pointData.name)
                ).toEqual([
                    'Direct Sales',
                    'Inside Sales'
                ]);
            });

            it('should fill correct pointData color', () => {
                expect(
                    pieSeriesItemData.map(pointData => pointData.color)
                ).toEqual([
                    FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                    SECOND_DEFAULT_COLOR_ITEM_AS_STRING
                ]);

                expect(
                    treemapSeriesItemData.map(pointData => pointData.color)
                ).toEqual([
                    FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                    SECOND_DEFAULT_COLOR_ITEM_AS_STRING
                ]);
            });

            it('should fill correct pointData legendIndex', () => {
                expect(
                    pieSeriesItemData.map(pointData => pointData.legendIndex)
                ).toEqual([0, 1]);

                expect(
                    treemapSeriesItemData.map(pointData => pointData.legendIndex)
                ).toEqual([0, 1]);
            });

            it('should fill correct pointData format', () => {
                expect(
                    pieSeriesItemData.map(pointData => pointData.format)
                ).toEqual(['#,##0.00', '#,##0.00']);

                expect(
                    treemapSeriesItemData.map(pointData => pointData.format)
                ).toEqual(['#,##0.00', '#,##0.00']);
            });
        });
    });

    describe('getSeries', () => {
        describe('in usecase of bar chart with 3 measures and view by attribute', () => {
            const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;
            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dataSet);

            const attributeColorStrategy = new AttributeColorStrategy(
                DEFAULT_COLOR_PALETTE,
                undefined,
                viewByAttribute,
                stackByAttribute,
                fixtures.barChartWith3MetricsAndViewByAttribute.executionResponse,
                fixtures.barChartWith3MetricsAndViewByAttribute.executionRequest.afm
            );

            const type = 'column';
            const seriesData = getSeries(
                dataSet.executionResult.data,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                type,
                {} as any,
                attributeColorStrategy
            );

            it('should return number of series equal to the count of measures', () => {
                expect(seriesData.length).toBe(3);
            });

            it('should fill correct series name', () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.name)).toEqual([
                    '<button>Lost</button> ...',
                    'Won',
                    'Expected'
                ]);
            });

            it('should fill correct series color', () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.color)).toEqual([
                    FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                    SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                    getRgbString(DEFAULT_COLOR_PALETTE[2])
                ]);
            });

            it('should fill correct series legendIndex', () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.legendIndex)).toEqual([0, 1, 2]);
            });

            it('should fill correct series data', () => {
                const expectedData = [0, 1, 2].map(((seriesIndex: any) => {
                    const parameters = getSeriesItemDataParameters(dataSet, seriesIndex);
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
                        attributeColorStrategy
                    );
                }));
                expect(seriesData.map((seriesItem: any) => seriesItem.data)).toEqual(expectedData);
            });
        });

        describe('in usecase of bar chart with stack by and view by attributes', () => {
            const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dataSet);
            const type = 'column';

            const attributeColorStrategy = new AttributeColorStrategy(
                DEFAULT_COLOR_PALETTE,
                undefined,
                viewByAttribute,
                stackByAttribute,
                fixtures.barChartWithStackByAndViewByAttributes.executionResponse,
                fixtures.barChartWithStackByAndViewByAttributes.executionRequest.afm
            );

            const seriesData = getSeries(
                dataSet.executionResult.data,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                type,
                {} as any,
                attributeColorStrategy
            );

            it('should return number of series equal to the count of stack by attribute values', () => {
                expect(seriesData.length).toBe(2);
            });

            it('should fill correct series name equal to stack by attribute values', () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.name)).toEqual([
                    'East Coast',
                    'West Coast'
                ]);
            });

            it('should fill correct series color', () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.color)).toEqual([
                    FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                    SECOND_DEFAULT_COLOR_ITEM_AS_STRING
                ]);
            });

            it('should fill correct series legendIndex', () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.legendIndex)).toEqual([0, 1]);
            });

            it('should fill correct series data', () => {
                const expectedData = [0, 1].map(((seriesIndex) => {
                    const parameters = getSeriesItemDataParameters(dataSet, seriesIndex);
                    const seriesItem = parameters[0];
                    const si = parameters[1];
                    const measureGroup = parameters[2];
                    const viewByAttribute = parameters[3];
                    const stackByAttribute = parameters[4];

                    const attributeColorStrategy = new AttributeColorStrategy(
                        DEFAULT_COLOR_PALETTE,
                        undefined,
                        measureGroup,
                        viewByAttribute,
                        stackByAttribute,
                        fixtures.barChartWith3MetricsAndViewByAttribute.executionRequest.afm
                    );

                    return getSeriesItemData(
                        seriesItem,
                        si,
                        measureGroup,
                        viewByAttribute,
                        stackByAttribute,
                        type,
                        attributeColorStrategy
                    );
                }));
                expect(seriesData.map((seriesItem: any) => seriesItem.data)).toEqual(expectedData);
            });
        });

        describe('in use case of bubble', () => {
            const dummyBucketItem = {
                visualizationAttribute: {
                    localIdentifier: 'abc',
                    displayForm: { uri: 'abc' }
                }
            };

            const dummyMeasureGroup = {
                items: [
                    {
                        measureHeaderItem: {
                            localIdentifier: 'm1',
                            name: 'dummyName',
                            format: '#.##x'
                        }

                    }
                ]
            };

            const dummyExecutionResponse: Execution.IExecutionResponse = {
                dimensions: [
                    {
                        headers: [{
                            measureGroupHeader: dummyMeasureGroup
                        }]
                    }
                ],
                links: { executionResult: 'foo' }
            };

            const stackByAttribute = {
                items: [
                    {
                        attributeHeaderItem: {
                            name: 'abc'
                        }
                    }, {
                        attributeHeaderItem: {
                            name: 'def'
                        }
                    }
                ]
            };

            const colorPalette = [{
                guid: '3',
                fill: {
                    r: 255,
                    g: 0,
                    b: 0
                }
            }, {
                guid: '2',
                fill: {
                    r: 0,
                    g: 255,
                    b: 0
                }
            }];

            it('should fill X, Y and Z with valid values when measure buckets are not empty', () => {
                const executionResultData = [
                    [ 1, 2, 3],
                    [ 4, 5, 6]
                ];

                const mdObject = {
                    visualizationClass: { uri: 'abc' },
                    buckets: [
                        {
                            localIdentifier: 'measures',
                            items: [ dummyBucketItem ]
                        }, {
                            localIdentifier: 'secondary_measures',
                            items: [ dummyBucketItem ]
                        }, {
                            localIdentifier: 'tertiary_measures',
                            items: [ dummyBucketItem ]
                        }
                    ]
                };

                const expectedSeries = [
                    {
                        name: 'abc',
                        color: 'rgb(255,0,0)',
                        legendIndex: 0,
                        data: [{ x: 1, y: 2, z: 3, format: '#.##x' }]
                    }, {
                        name: 'def',
                        color: undefined,
                        legendIndex: 1,
                        data: [{ x: 4, y: 5, z: 6, format: '#.##x' }]
                    }
                ];

                const colorStrategy = new BubbleChartColorStrategy(
                    colorPalette,
                    undefined,
                    null,
                    stackByAttribute,
                    dummyExecutionResponse,
                    {}
                );

                const series = getBubbleChartSeries(
                    executionResultData,
                    dummyMeasureGroup,
                    stackByAttribute,
                    mdObject,
                    colorStrategy
                );

                expect(series).toEqual(expectedSeries);
            });

            it('should fill X and Y with zeroes when X and Y measure buckets are empty', () => {
                const executionResultData = [
                    [3],
                    [6]
                ];

                const mdObject = {
                    visualizationClass: { uri: 'abc' },
                    buckets: [{
                        localIdentifier: 'tertiary_measures',
                        items: [dummyBucketItem]
                    }]
                };

                const expectedSeries = [
                    {
                        name: '',
                        color: 'rgb(255,0,0)',
                        legendIndex: 0,
                        data: [{ x: 0, y: 0, z: 3, format: '#.##x' }]
                    }, {
                        name: '',
                        color: undefined,
                        legendIndex: 1,
                        data: [{ x: 0, y: 0, z: 6, format: '#.##x' }]
                    }
                ];

                const colorStrategy = new BubbleChartColorStrategy(
                    colorPalette,
                    undefined,
                    null,
                    stackByAttribute,
                    dummyExecutionResponse,
                    {}
                );

                const series = getBubbleChartSeries(
                    executionResultData,
                    dummyMeasureGroup,
                    null,
                    mdObject,
                    colorStrategy
                );

                expect(series).toEqual(expectedSeries);
            });

            it('should fill Y with x values when primary bucket is empty but secondary is not', () => {
                const executionResultData = [
                    [ 1, 3],
                    [ 4, 6]
                ];

                const mdObject = {
                    visualizationClass: { uri: 'abc' },
                    buckets: [
                        {
                            localIdentifier: 'secondary_measures',
                            items: [ dummyBucketItem ]
                        }, {
                            localIdentifier: 'tertiary_measures',
                            items: [dummyBucketItem]
                        }
                    ]
                };

                const expectedSeries = [
                    {
                        name: 'abc',
                        color: 'rgb(255,0,0)',
                        legendIndex: 0,
                        data: [{ x: 0, y: 1, z: 3, format: '#.##x' }]
                    }, {
                        name: 'def',
                        color: undefined,
                        legendIndex: 1,
                        data: [{ x: 0, y: 4, z: 6, format: '#.##x' }]
                    }
                ];

                const colorStrategy = new BubbleChartColorStrategy(
                    colorPalette,
                    undefined,
                    stackByAttribute,
                    stackByAttribute,
                    dummyExecutionResponse,
                    {}
                );

                const series = getBubbleChartSeries(
                    executionResultData,
                    dummyMeasureGroup,
                    stackByAttribute,
                    mdObject,
                    colorStrategy
                );

                expect(series).toEqual(expectedSeries);
            });

            it('should fill X with x and Z with z values when secondary bucket is empty', () => {
                const executionResultData = [
                    [1, 3],
                    [4, 6]
                ];

                const mdObject = {
                    visualizationClass: { uri: 'abc' },
                    buckets: [
                        {
                            localIdentifier: 'measures',
                            items: [dummyBucketItem]
                        }, {
                            localIdentifier: 'tertiary_measures',
                            items: [dummyBucketItem]
                        }
                    ]
                };

                const expectedSeries = [
                    {
                        name: 'abc',
                        color: 'rgb(255,0,0)',
                        legendIndex: 0,
                        data: [{ x: 1, y: 0, z: 3, format: '#.##x' }]
                    }, {
                        name: 'def',
                        color: undefined,
                        legendIndex: 1,
                        data: [{ x: 4, y: 0, z: 6, format: '#.##x' }]
                    }
                ];

                const colorStrategy = new BubbleChartColorStrategy(
                    colorPalette,
                    undefined,
                    stackByAttribute,
                    stackByAttribute,
                    dummyExecutionResponse,
                    null
                );

                const series = getBubbleChartSeries(
                    executionResultData,
                    dummyMeasureGroup,
                    stackByAttribute,
                    mdObject,
                    colorStrategy
                );

                expect(series).toEqual(expectedSeries);
            });

            it('should fill Z with NaNs when tertiary bucket is empty', () => {
                const executionResultData = [
                    [1, 3],
                    [4, 6]
                ];

                const mdObject = {
                    visualizationClass: { uri: 'abc' },
                    buckets: [
                        {
                            localIdentifier: 'measures',
                            items: [dummyBucketItem]
                        }, {
                            localIdentifier: 'secondary_measures',
                            items: [dummyBucketItem]
                        }
                    ]
                };

                const expectedSeries = [
                    {
                        name: 'abc',
                        color: 'rgb(255,0,0)',
                        legendIndex: 0,
                        data: [{ x: 1, y: 3, z: NaN, format: '#.##x' }]
                    }, {
                        name: 'def',
                        color: undefined,
                        legendIndex: 1,
                        data: [{ x: 4, y: 6, z: NaN, format: '#.##x' }]
                    }
                ];

                const colorStrategy = new BubbleChartColorStrategy(
                    colorPalette,
                    undefined,
                    null,
                    stackByAttribute,
                    dummyExecutionResponse,
                    null
                );

                const series = getBubbleChartSeries(
                    executionResultData,
                    dummyMeasureGroup,
                    stackByAttribute,
                    mdObject,
                    colorStrategy
                );

                expect(series).toEqual(expectedSeries);
            });

            it('should handle null in result', () => {
                const executionResultData = [
                    [null, 2, 3],
                    [4, null, 6],
                    [7, 8, null]
                ];
                const stackByAttributeWithThreeElements = {
                    items: [
                        {
                            attributeHeaderItem: {
                                name: 'abc'
                            }
                        }, {
                            attributeHeaderItem: {
                                name: 'def'
                            }
                        }, {
                            attributeHeaderItem: {
                                name: 'ghi'
                            }
                        }
                    ]
                };
                const mdObject = {
                    visualizationClass: { uri: 'abc' },
                    buckets: [
                        {
                            localIdentifier: 'measures',
                            items: [dummyBucketItem]
                        }, {
                            localIdentifier: 'secondary_measures',
                            items: [dummyBucketItem]
                        }, {
                            localIdentifier: 'tertiary_measures',
                            items: [dummyBucketItem]
                        }
                    ]
                };
                const colorPaletteWithBlue = [
                    ...colorPalette,
                    {
                        guid: '1',
                        fill: {
                            r: 0,
                            g: 0,
                            b: 255
                        }
                    }
                ];

                const expectedSeries = [
                    {
                        name: 'abc',
                        color: 'rgb(255,0,0)',
                        legendIndex: 0,
                        data: [] as any
                    }, {
                        name: 'def',
                        color: undefined,
                        legendIndex: 1,
                        data: []
                    }, {
                        name: 'ghi',
                        color: undefined,
                        legendIndex: 2,
                        data: []
                    }
                ];

                const colorStrategy = new BubbleChartColorStrategy(
                    colorPaletteWithBlue,
                    undefined,
                    null,
                    stackByAttributeWithThreeElements,
                    dummyExecutionResponse,
                    null
                );

                const series = getBubbleChartSeries(
                    executionResultData,
                    dummyMeasureGroup,
                    stackByAttributeWithThreeElements,
                    mdObject,
                    colorStrategy
                );

                expect(series).toEqual(expectedSeries);
            });
        });

        describe('in use case of treemap', () => {
            describe('with only one measure', () => {
                const dataSet = fixtures.barChartWithSingleMeasureAndNoAttributes;
                const { measureGroup, viewByAttribute, stackByAttribute } = getMVSTreemap(dataSet);
                const type = 'treemap';

                const treeMapColorStrategy = new TreemapColorStrategy(
                    DEFAULT_COLOR_PALETTE,
                    undefined,
                    measureGroup,
                    viewByAttribute,
                    stackByAttribute,
                    fixtures.barChartWithSingleMeasureAndNoAttributes.executionRequest.afm
                );

                const seriesData = getSeries(
                    dataSet.executionResult.data,
                    measureGroup,
                    viewByAttribute,
                    stackByAttribute,
                    type,
                    {} as any,
                    treeMapColorStrategy
                );

                it('should return only one serie', () => {
                    expect(seriesData.length).toBe(1);
                });

                it('should fill correct series name equal to measure name', () => {
                    expect(seriesData[0].name).toEqual('Amount');
                });

                it('should fill correct series color', () => {
                    expect(seriesData[0].color).toEqual(FIRST_DEFAULT_COLOR_ITEM_AS_STRING);
                });

                it('should fill correct series legendIndex', () => {
                    expect(seriesData[0].legendIndex).toEqual(0);
                });

                it('should fill correct series data', () => {
                    expect(seriesData[0].data.length).toBe(1);
                    expect(seriesData[0].data[0]).toMatchObject({
                        value: 116625456.54,
                        color: FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                        format: '#,##0.00',
                        legendIndex: 0,
                        name: 'Amount',
                        marker: expect.any(Object)
                    });
                });
            });

            describe('with one measure and view by attribute', () => {
                const dataSet = fixtures.treemapWithMetricAndViewByAttribute;
                const { measureGroup, viewByAttribute, stackByAttribute } = getMVSTreemap(dataSet);
                const type = 'treemap';
                const treeMapColorStrategy = new TreemapColorStrategy(
                    DEFAULT_COLOR_PALETTE,
                    undefined,
                    viewByAttribute,
                    stackByAttribute,
                    fixtures.treemapWithMetricAndViewByAttribute.executionResponse,
                    fixtures.treemapWithMetricAndViewByAttribute.executionRequest.afm
                );
                const seriesData = getSeries(
                    dataSet.executionResult.data,
                    measureGroup,
                    viewByAttribute,
                    stackByAttribute,
                    type,
                    dataSet.mdObject,
                    treeMapColorStrategy
                );

                it('should return only one serie', () => {
                    expect(seriesData.length).toBe(1);
                });

                it('should fill correct series name equal to measure name', () => {
                    expect(seriesData[0].name).toEqual('Amount');
                });

                it('should fill correct series legendIndex', () => {
                    expect(seriesData[0].legendIndex).toEqual(0);
                });

                it('should fill correct series data', () => {
                    expect(seriesData[0].data.length).toBe(2);
                    expect(seriesData[0].data[0]).toMatchObject({
                        value: 80406324.96,
                        color: FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                        format: '#,##0.00',
                        legendIndex: 0,
                        name: 'Direct Sales',
                        marker: expect.any(Object)
                    });

                    expect(seriesData[0].data[1]).toMatchObject({
                        value: 36219131.58,
                        color: SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                        format: '#,##0.00',
                        legendIndex: 1,
                        name: 'Inside Sales',
                        marker: expect.any(Object)
                    });
                });
            });

            describe('with one measure and stack by attribute', () => {
                const dataSet = fixtures.treemapWithMetricAndStackByAttribute;
                const { measureGroup, viewByAttribute, stackByAttribute } = getMVSTreemap(dataSet);
                const type = 'treemap';

                const treeMapColorStrategy = new TreemapColorStrategy(
                    DEFAULT_COLOR_PALETTE,
                    undefined,
                    measureGroup,
                    viewByAttribute,
                    stackByAttribute,
                    fixtures.treemapWithMetricAndStackByAttribute.executionRequest.afm
                );

                const seriesData = getSeries(
                    dataSet.executionResult.data,
                    measureGroup,
                    viewByAttribute,
                    stackByAttribute,
                    type,
                    dataSet.mdObject,
                    treeMapColorStrategy
                );

                it('should return only one serie', () => {
                    expect(seriesData.length).toBe(1);
                });

                it('should fill correct series name equal to measure name', () => {
                    expect(seriesData[0].name).toEqual('Amount');
                });

                it('should fill correct series data', () => {
                    expect(seriesData[0].data.length).toBe(3); // parent + 2 leafs

                    expect(seriesData[0].data[0]).toMatchObject({
                        id: '0',
                        name: 'Amount',
                        color: FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                        showInLegend: true,
                        legendIndex: 0,
                        format: '#,##0.00'
                    });

                    expect(seriesData[0].data[1]).toMatchObject({
                        parent: '0',
                        x: 0,
                        y: 0,
                        value: 80406324.96,
                        color: FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'Direct Sales'
                    });

                    expect(seriesData[0].data[2]).toMatchObject({
                        parent: '0',
                        x: 0,
                        y: 1,
                        value: 36219131.58,
                        color: getLighterColor(FIRST_DEFAULT_COLOR_ITEM_AS_STRING, 0.4),
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'Inside Sales'
                    });
                });
            });

            describe('with one measure, view by and stack by attribute', () => {
                const dataSet = fixtures.treemapWithMetricViewByAndStackByAttribute;
                const { measureGroup, viewByAttribute, stackByAttribute } = getMVSTreemap(dataSet);
                const type = 'treemap';
                const treeMapColorStrategy = new TreemapColorStrategy(
                    DEFAULT_COLOR_PALETTE,
                    undefined,
                    viewByAttribute,
                    stackByAttribute,
                    fixtures.treemapWithMetricViewByAndStackByAttribute.executionResponse,
                    fixtures.treemapWithMetricViewByAndStackByAttribute.executionRequest.afm
                );
                const seriesData = getSeries(
                    dataSet.executionResult.data,
                    measureGroup,
                    viewByAttribute,
                    stackByAttribute,
                    type,
                    dataSet.mdObject,
                    treeMapColorStrategy
                );

                it('should return only one serie', () => {
                    expect(seriesData.length).toBe(1);
                });

                it('should fill correct series name equal to measure name', () => {
                    expect(seriesData[0].name).toEqual('Amount');
                });

                it('should fill correct series data', () => {
                    expect(seriesData[0].data.length).toBe(6); // 2 parents + 2 * 2 leafs

                    expect(seriesData[0].data[0]).toMatchObject({
                        id: '0',
                        name: 'Direct Sales',
                        color: FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                        showInLegend: true,
                        legendIndex: 0,
                        format: '#,##0.00'
                    });
                    expect(seriesData[0].data[1]).toMatchObject({
                        id: '1',
                        name: 'Inside Sales',
                        color: SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                        showInLegend: true,
                        legendIndex: 1,
                        format: '#,##0.00'
                    });

                    expect(seriesData[0].data[2]).toMatchObject({
                        parent: '0',
                        x: 0,
                        y: 0,
                        value: 58427629.5,
                        color: FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'West Coast'
                    });

                    expect(seriesData[0].data[3]).toMatchObject({
                        parent: '0',
                        x: 1,
                        y: 1,
                        value: 21978695.46,
                        color: getLighterColor(FIRST_DEFAULT_COLOR_ITEM_AS_STRING, 0.4),
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'East Coast'
                    });

                    expect(seriesData[0].data[4]).toMatchObject({
                        parent: '1',
                        x: 2,
                        y: 2,
                        value: 30180730.62,
                        color: SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'West Coast'
                    });

                    expect(seriesData[0].data[5]).toMatchObject({
                        parent: '1',
                        x: 3,
                        y: 3,
                        value: 6038400.96,
                        color: getLighterColor(SECOND_DEFAULT_COLOR_ITEM_AS_STRING, 0.4),
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'East Coast'
                    });
                });
            });

            describe('with two measures and stack by attribute including client sorting', () => {
                const dataSet = fixtures.treemapWithTwoMetricsAndStackByAttribute;
                const { measureGroup, viewByAttribute, stackByAttribute } = getMVSTreemap(dataSet);
                const type = 'treemap';
                const treeMapColorStrategy = new TreemapColorStrategy(
                    DEFAULT_COLOR_PALETTE,
                    undefined,
                    viewByAttribute,
                    stackByAttribute,
                    fixtures.treemapWithTwoMetricsAndStackByAttribute.executionResponse,
                    fixtures.treemapWithTwoMetricsAndStackByAttribute.executionRequest.afm
                );
                const seriesData = getSeries(
                    dataSet.executionResult.data,
                    measureGroup,
                    viewByAttribute,
                    stackByAttribute,
                    type,
                    dataSet.mdObject,
                    treeMapColorStrategy
                );

                it('should return only one serie', () => {
                    expect(seriesData.length).toBe(1);
                });

                it('should fill correct series name equal to measure name', () => {
                    expect(seriesData[0].name).toEqual('Amount, # of Open Opps.');
                });

                it('should fill correct series data', () => {
                    expect(seriesData[0].data.length).toBe(6); // 2 parents + 2 * 2 leafs

                    expect(seriesData[0].data[0]).toMatchObject({
                        id: '0',
                        name: 'Amount',
                        color: FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                        showInLegend: true,
                        legendIndex: 0,
                        format: '#,##0.00'
                    });
                    expect(seriesData[0].data[1]).toMatchObject({
                        id: '1',
                        name: '# of Open Opps.',
                        color: SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                        showInLegend: true,
                        legendIndex: 1,
                        format: '#,##0.00'
                    });

                    expect(seriesData[0].data[2]).toMatchObject({
                        parent: '0',
                        x: 0,
                        y: 0,
                        value: 58427629.5,
                        color: FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'Direct Sales'
                    });

                    expect(seriesData[0].data[3]).toMatchObject({
                        parent: '0',
                        x: 0,
                        y: 1,
                        value: 21978695.46,
                        color: getLighterColor(FIRST_DEFAULT_COLOR_ITEM_AS_STRING, 0.4),
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'Inside Sales'
                    });

                    expect(seriesData[0].data[4]).toMatchObject({
                        parent: '1',
                        x: 1,
                        y: 1,
                        value: 30180730.62,
                        color: SECOND_DEFAULT_COLOR_ITEM_AS_STRING,
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'Inside Sales'
                    });

                    expect(seriesData[0].data[5]).toMatchObject({
                        parent: '1',
                        x: 1,
                        y: 0,
                        value: 6038400.96,
                        color: getLighterColor(SECOND_DEFAULT_COLOR_ITEM_AS_STRING, 0.4),
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'Direct Sales'
                    });
                });
            });
        });
    });

    describe('getDrillIntersection', () => {
        it('should return correct intersection for bar chart with stack by and view by attributes', () => {
            const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dataSet);
            /*
            "measureHeaderItem": {
                "name": "Amount",
                "format": "#,##0.00",
                "localIdentifier": "amountMetric",
                "uri": "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1279",
                "identifier": "ah1EuQxwaCqs"
            }
            */
            const measures = [measureGroup.items[0].measureHeaderItem];

            const viewByItem = {
                ...viewByAttribute.items[0].attributeHeaderItem,
                attribute: viewByAttribute
            };

            const stackByItem = {
                ...stackByAttribute.items[0].attributeHeaderItem,
                attribute: stackByAttribute
            };

            const { afm } = dataSet.executionRequest;
            const drillIntersection = getDrillIntersection(stackByItem, viewByItem, measures, afm);
            expect(drillIntersection).toEqual([
                {
                    id: 'amountMetric',
                    title: 'Amount',
                    header: {
                        identifier: 'ah1EuQxwaCqs',
                        uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1279'
                    }
                },
                {
                    id: '1226',
                    title: 'Direct Sales',
                    header: {
                        identifier: 'label.owner.department',
                        uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1027'
                    }
                },
                {
                    id: '1225',
                    title: 'East Coast',
                    header: {
                        identifier: 'label.owner.region',
                        uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1024'
                    }
                }
            ]);
        });

        it('should return correct intersection for pie chart measures only', () => {
            const dataSet = fixtures.pieChartWithMetricsOnly;
            const { measureGroup } = getMVS(dataSet);
            const measures = [measureGroup.items[0].measureHeaderItem];

            const viewByItem: any = null;
            const stackByItem: any = null;

            const { afm } = dataSet.executionRequest;
            const drillIntersection = getDrillIntersection(stackByItem, viewByItem, measures, afm);
            expect(drillIntersection).toEqual([
                {
                    id: 'lostMetric',
                    title: 'Lost',
                    header: {
                        identifier: 'af2Ewj9Re2vK',
                        uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283'
                    }
                }
            ]);
        });
    });

    describe('getDrillableSeries', () => {
        describe('in usecase of scatter plot with 2 measures and attribute', () => {
            const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;
            const { afm } = dataSet.executionRequest;
            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dataSet);
            const type = 'scatter';

            const metricColorStrategy = new MeasureColorStrategy(
                DEFAULT_COLOR_PALETTE,
                undefined,
                viewByAttribute,
                stackByAttribute,
                fixtures.barChartWith3MetricsAndViewByAttribute.executionResponse,
                fixtures.barChartWith3MetricsAndViewByAttribute.executionRequest.afm
            );

            const seriesWithoutDrillability = getSeries(
                dataSet.executionResult.data,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                type,
                {} as any,
                metricColorStrategy
            );

            const drillableMeasures = [
                headerPredicateFactory.uriMatch(
                    dataSet.executionResponse.dimensions[0]
                    .headers[0].measureGroupHeader.items[0].measureHeaderItem.uri
                )
            ];
            const drillableMeasuresSeriesData = getDrillableSeries(
                seriesWithoutDrillability,
                drillableMeasures,
                viewByAttribute,
                stackByAttribute,
                dataSet.executionResponse,
                afm,
                type
            );

            it('should assign correct drillIntersection to pointData with drilldown true', () => {
                expect(drillableMeasuresSeriesData
                    .map((seriesItem: any) => seriesItem.data[0].drillIntersection)
                ).toEqual([
                    [
                        {
                            id: 'lostMetric',
                            title: '<button>Lost</button> ...',
                            header: {
                                identifier: 'af2Ewj9Re2vK',
                                uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283'
                            }
                        }, {
                            id: 'wonMetric',
                            title: 'Won',
                            header: {
                                identifier: 'afSEwRwdbMeQ',
                                uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1284'
                            }
                        }, {
                            id: '2008',
                            title: '<button>2008</button>',
                            header: {
                                identifier: 'created.aag81lMifn6q',
                                uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/158'
                            }
                        }
                    ]
                ]);
            });

            it('should fillter out points with one or both coordinates null', () => {
                const dataSetWithNulls = fixtures.scatterWithNulls;
                const { afm } = dataSetWithNulls.executionRequest;
                const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dataSetWithNulls);
                const type = 'scatter';

                const metricColorStrategy = new MeasureColorStrategy(
                    DEFAULT_COLOR_PALETTE,
                    undefined,
                    viewByAttribute,
                    stackByAttribute,
                    fixtures.scatterWithNulls.executionResponse,
                    fixtures.scatterWithNulls.executionRequest.afm
                );

                const seriesWithoutDrillability = getSeries(
                    dataSetWithNulls.executionResult.data,
                    measureGroup,
                    viewByAttribute,
                    stackByAttribute,
                    type,
                    dataSetWithNulls.mdObject,
                    metricColorStrategy
                );

                const drillableMeasures = [
                    headerPredicateFactory.uriMatch(
                        dataSetWithNulls.executionResponse.dimensions[1]
                        .headers[0].measureGroupHeader.items[1].measureHeaderItem.uri
                    )
                ];
                const drillableMeasuresSeriesData = getDrillableSeries(
                    seriesWithoutDrillability,
                    drillableMeasures,
                    viewByAttribute,
                    stackByAttribute,
                    dataSetWithNulls.executionResponse,
                    afm,
                    type
                );
                expect(seriesWithoutDrillability[0].data.length).toEqual(6);
                expect(drillableMeasuresSeriesData[0].data.length).toEqual(3);
            });
        });

        describe('in usecase of bubble chart with 3 measures and attribute', () => {
            const dataSet = fixtures.bubbleChartWith3MetricsAndAttribute;
            const { afm } = dataSet.executionRequest;
            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dataSet);
            const type = 'bubble';

            const attributeColorStrategy = new AttributeColorStrategy(
                DEFAULT_COLOR_PALETTE,
                undefined,
                viewByAttribute,
                stackByAttribute,
                fixtures.bubbleChartWith3MetricsAndAttribute.executionResponse,
                fixtures.bubbleChartWith3MetricsAndAttribute.executionRequest.afm
            );

            const seriesWithoutDrillability = getSeries(
                dataSet.executionResult.data,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                type,
                dataSet.mdObject,
                attributeColorStrategy
            );
            const drillableMeasures = [
                headerPredicateFactory.uriMatch(
                    dataSet.executionResponse.dimensions[1]
                    .headers[0].measureGroupHeader.items[0].measureHeaderItem.uri
                )
            ];
            const drillableMeasuresSeriesData = getDrillableSeries(
                seriesWithoutDrillability,
                drillableMeasures,
                viewByAttribute,
                stackByAttribute,
                dataSet.executionResponse,
                afm,
                type
            );

            it('should assign correct drillIntersection to pointData with drilldown true', () => {
                expect(drillableMeasuresSeriesData.length).toBe(20);
                expect(drillableMeasuresSeriesData[8].data[0]).toEqual({
                    x: 245,
                    y: 32,
                    z: 2280481.04,
                    format: '$#,#00.00',
                    drilldown: true,
                    drillIntersection: [
                        {
                            id: '784a5018a51049078e8f7e86247e08a3',
                            title: '_Snapshot [EOP-2]',
                            header: {
                                identifier: 'ab0bydLaaisS',
                                uri: '/gdc/md/hzyl5wlh8rnu0ixmbzlaqpzf09ttb7c8/obj/67097'
                            }
                        },
                        {
                            id: '9e5c3cd9a93f4476a93d3494cedc6010',
                            title: '# of Open Opps.',
                            header: {
                                identifier: 'aaYh6Voua2yj',
                                uri: '/gdc/md/hzyl5wlh8rnu0ixmbzlaqpzf09ttb7c8/obj/13465'
                            }
                        },
                        {
                            id: '71d50cf1d13746099b7f506576d78e4a',
                            title: 'Remaining Quota',
                            header: {
                                identifier: 'ab4EFOAmhjOx',
                                uri: '/gdc/md/hzyl5wlh8rnu0ixmbzlaqpzf09ttb7c8/obj/1543'
                            }
                        },
                        {
                            id: '1235',
                            title: 'Jessica Traven',
                            header: {
                                identifier: 'label.owner.id.name',
                                uri: '/gdc/md/hzyl5wlh8rnu0ixmbzlaqpzf09ttb7c8/obj/1028'
                            }
                        }
                    ]
                });
                drillableMeasuresSeriesData
                    .map((seriesItem: any, index: number) => {
                        expect(seriesItem.isDrillable).toEqual(true);
                        expect(seriesItem.legendIndex).toEqual(index);
                        expect(seriesItem.data[0].drilldown).toEqual(true);
                    });
            });

            it('should fillter out points with some of measures are null', () => {
                const dataSetWithNulls = fixtures.bubbleChartWithNulls;
                const { afm } = dataSetWithNulls.executionRequest;
                const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dataSetWithNulls);
                const type = 'bubble';

                const attributeColorStrategy = new AttributeColorStrategy(
                    DEFAULT_COLOR_PALETTE,
                    undefined,
                    viewByAttribute,
                    stackByAttribute,
                    fixtures.bubbleChartWithNulls.executionResponse,
                    fixtures.bubbleChartWithNulls.executionRequest.afm
                );

                const seriesWithoutDrillability = getSeries(
                    dataSetWithNulls.executionResult.data,
                    measureGroup,
                    viewByAttribute,
                    stackByAttribute,
                    type,
                    dataSetWithNulls.mdObject,
                    attributeColorStrategy
                );

                const drillableMeasures = [
                    headerPredicateFactory.uriMatch(
                        dataSetWithNulls.executionResponse.dimensions[1]
                        .headers[0].measureGroupHeader.items[1].measureHeaderItem.uri
                    )
                ];
                const drillableMeasuresSeriesData = getDrillableSeries(
                    seriesWithoutDrillability,
                    drillableMeasures,
                    viewByAttribute,
                    stackByAttribute,
                    dataSetWithNulls.executionResponse,
                    afm,
                    type
                );
                expect(drillableMeasuresSeriesData[0].data.length).toEqual(0); // x is null
                expect(drillableMeasuresSeriesData[1].data.length).toEqual(0); // y is null
                expect(drillableMeasuresSeriesData[2].data.length).toEqual(0); // x and y are null
                expect(drillableMeasuresSeriesData[3].data.length).toEqual(0); // z is null
            });
        });

        describe('in usecase of bar chart with 6 pop measures and view by attribute', () => {
            const dataSet = fixtures.barChartWith6PopMeasuresAndViewByAttribute;
            const { afm } = dataSet.executionRequest;
            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dataSet);
            const type = 'bar';
            const metricColorStrategy = new MeasureColorStrategy(
                DEFAULT_COLOR_PALETTE,
                undefined,
                viewByAttribute,
                stackByAttribute,
                fixtures.barChartWith6PopMeasuresAndViewByAttribute.executionResponse,
                fixtures.barChartWith6PopMeasuresAndViewByAttribute.executionRequest.afm
            );
            const seriesWithoutDrillability = getSeries(
                dataSet.executionResult.data,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                type,
                {} as any,
                metricColorStrategy
            );

            describe('with all drillable measures', () => {
                const drillableMeasures = [
                    headerPredicateFactory.uriMatch(dataSet.executionRequest.afm.attributes[0].displayForm.uri)
                ];
                const drillableMeasuresSeriesData = getDrillableSeries(
                    seriesWithoutDrillability,
                    drillableMeasures,
                    viewByAttribute,
                    stackByAttribute,
                    dataSet.executionResponse,
                    afm,
                    type
                );

                it('should assign correct drillIntersection to pointData with drilldown true', () => {
                    const startYear = parseInt(// should be 2008
                        drillableMeasuresSeriesData[0].data[0].drillIntersection[1].value, 10
                    );
                    drillableMeasuresSeriesData.forEach((seriesItem: any) => {
                        seriesItem.data.forEach((point: any, index: number) => {
                            expect(point.drillIntersection[1].value - index).toEqual(startYear);
                        });
                    });
                });
            });
        });

        describe('in usecase of bar chart with 6 previous period measures', () => {
            const dataSet = fixtures.barChartWith6PreviousPeriodMeasures;
            const { afm } = dataSet.executionRequest;
            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dataSet);
            const type = 'bar';
            const metricColorStrategy = new MeasureColorStrategy(
                DEFAULT_COLOR_PALETTE,
                undefined,
                viewByAttribute,
                stackByAttribute,
                fixtures.barChartWith6PreviousPeriodMeasures.executionResponse,
                fixtures.barChartWith6PreviousPeriodMeasures.executionRequest.afm
            );
            const seriesWithoutDrillability = getSeries(
                dataSet.executionResult.data,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                type,
                {} as any,
                metricColorStrategy
            );

            describe('with all drillable measures', () => {
                const drillableMeasures = [
                    headerPredicateFactory.uriMatch(dataSet.executionRequest.afm.attributes[0].displayForm.uri)
                ];
                const drillableMeasuresSeriesData = getDrillableSeries(
                    seriesWithoutDrillability,
                    drillableMeasures,
                    viewByAttribute,
                    stackByAttribute,
                    dataSet.executionResponse,
                    afm,
                    type
                );

                it('should assign correct drillIntersection to pointData with drilldown true', () => {
                    const startYear = parseInt(// should be 2008
                        drillableMeasuresSeriesData[0].data[0].drillIntersection[1].value, 10
                    );
                    drillableMeasuresSeriesData.forEach((seriesItem: any) => {
                        seriesItem.data.forEach((point: any, index: number) => {
                            expect(point.drillIntersection[1].value - index).toEqual(startYear);
                        });
                    });
                });
            });
        });

        describe('in usecase of bar chart with 3 measures and view by attribute', () => {
            const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;
            const { afm } = dataSet.executionRequest;
            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dataSet);
            const type = 'column';

            const attColorStrategy = new AttributeColorStrategy(
                DEFAULT_COLOR_PALETTE,
                undefined,
                viewByAttribute,
                stackByAttribute,
                fixtures.barChartWith3MetricsAndViewByAttribute.executionResponse,
                fixtures.barChartWith3MetricsAndViewByAttribute.executionRequest.afm
            );

            const seriesWithoutDrillability = getSeries(
                dataSet.executionResult.data,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                type,
                {} as any,
                attColorStrategy
            );

            describe('with no drillable items', () => {
                const noDrillableItems: any = [];
                const noDrillableSeriesData = getDrillableSeries(
                    seriesWithoutDrillability,
                    noDrillableItems,
                    viewByAttribute,
                    stackByAttribute,
                    dataSet.executionResponse,
                    afm,
                    type
                );
                it('should return the same number of items as seriesWithoutDrillability', () => {
                    expect(noDrillableSeriesData.length).toBe(seriesWithoutDrillability.length);
                });

                it('should return new series array with isDrillable false', () => {
                    expect(noDrillableSeriesData).not.toBe(seriesWithoutDrillability);
                    expect(noDrillableSeriesData
                        .map((seriesItem: any) => seriesItem.isDrillable)).toEqual([false, false, false]);
                });

                it('should return new pointData items drilldown false and no drillIntersection', () => {
                    expect(noDrillableSeriesData
                        .map((seriesItem: any) => seriesItem.data.map(({ drilldown, drillIntersection }: any) => {
                            return { drilldown, drillIntersection };
                        }))
                    ).toEqual([
                        [
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false }
                        ],
                        [
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false }
                        ],
                        [
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false },
                            { drillIntersection: undefined, drilldown: false }
                        ]
                    ]);
                });
            });

            describe('with first and last drillable measures', () => {
                const twoDrillableMeasuresItems = [
                    headerPredicateFactory.uriMatch('/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283'),
                    headerPredicateFactory.uriMatch('/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1285')
                ];
                const twoDrillableMeasuresSeriesData = getDrillableSeries(
                    seriesWithoutDrillability,
                    twoDrillableMeasuresItems,
                    viewByAttribute,
                    stackByAttribute,
                    dataSet.executionResponse,
                    afm,
                    type
                );
                it('should return the same number of items as seriesWithoutDrillability', () => {
                    expect(twoDrillableMeasuresSeriesData.length).toBe(seriesWithoutDrillability.length);
                });

                it('should return new series array with isDrillable true for the first and last measure ', () => {
                    expect(twoDrillableMeasuresSeriesData
                        .map((seriesItem: any) => seriesItem.isDrillable)).toEqual([true, false, true]);
                });

                it('should assign new pointData items with drilldown true in the first and last serie', () => {
                    expect(twoDrillableMeasuresSeriesData
                        .map((seriesItem: any) => seriesItem.data.map((pointData: any) => pointData.drilldown))
                    ).toEqual([
                        [true, true, true, true, true],
                        [false, false, false, false, false],
                        [true, true, true, true, true]
                    ]);
                });

                it('should assign correct drillIntersection to pointData with drilldown true', () => {
                    expect(twoDrillableMeasuresSeriesData
                        .map((seriesItem: any) => seriesItem.data[0].drillIntersection)
                    ).toEqual([
                        [
                            {
                                id: 'lostMetric',
                                title: '<button>Lost</button> ...',
                                header: {
                                    identifier: 'af2Ewj9Re2vK',
                                    uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283'
                                }
                            }, {
                                id: '2008',
                                title: '<button>2008</button>',
                                header: {
                                    identifier: 'created.aag81lMifn6q',
                                    uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/158'
                                }
                            }
                        ],
                        undefined,
                        [
                            {
                                id: 'expectedMetric',
                                title: 'Expected',
                                header: {
                                    identifier: 'alUEwmBtbwSh',
                                    uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1285'
                                }
                            }, {
                                id: '2008',
                                title: '<button>2008</button>',
                                header: {
                                    identifier: 'created.aag81lMifn6q',
                                    uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/158'
                                }
                            }
                        ]
                    ]);
                });
            });
        });

        describe('in usecase of bar chart with stack by and view by attributes', () => {
            const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dataSet);
            const type = 'column';

            const attColorStrategy = new AttributeColorStrategy(
                DEFAULT_COLOR_PALETTE,
                undefined,
                viewByAttribute,
                stackByAttribute,
                fixtures.barChartWithStackByAndViewByAttributes.executionResponse,
                fixtures.barChartWithStackByAndViewByAttributes.executionRequest.afm
            );

            const seriesData = getSeries(
                dataSet.executionResult.data,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                type,
                {} as any,
                attColorStrategy
            );

            it('should return number of series equal to the count of stack by attribute values', () => {
                expect(seriesData.length).toBe(2);
            });

            it('should fill correct series name equal to stack by attribute values', () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.name)).toEqual([
                    'East Coast',
                    'West Coast'
                ]);
            });

            it('should fill correct series color', () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.color)).toEqual([
                    FIRST_DEFAULT_COLOR_ITEM_AS_STRING,
                    SECOND_DEFAULT_COLOR_ITEM_AS_STRING
                ]);
            });

            it('should fill correct series legendIndex', () => {
                expect(seriesData.map((seriesItem: any) => seriesItem.legendIndex)).toEqual([0, 1]);
            });

            it('should fill correct series data', () => {
                const expectedData = [0, 1].map(((seriesIndex: any) => {
                    const parameters = getSeriesItemDataParameters(dataSet, seriesIndex);
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
                        attColorStrategy
                    );
                }));
                expect(seriesData.map((seriesItem: any) => seriesItem.data)).toEqual(expectedData);
            });
        });
    });

    describe('customEscape', () => {
        it('should encode some characters into named html entities', () => {
            const source = '&"<>';
            const expected = '&amp;&quot;&lt;&gt;';
            expect(customEscape(source)).toBe(expected);
        });
        it('should keep &lt; and &gt; untouched (unescape -> escape)', () => {
            const source = '&lt;&gt;';
            const expected = '&lt;&gt;';
            expect(customEscape(source)).toBe(expected);
        });
    });

    describe('generateTooltipFn', () => {
        const dataSet = fixtures.barChartWithViewByAttribute;
        const { viewByAttribute } = getMVS(dataSet);
        const pointData = {
            y: 1,
            format: '# ###',
            name: 'point',
            category: {
                name: 'category'
            },
            series: {
                name: 'series'
            }
        };

        function getValues(str: any) {
            const test = />([^<]+)<\/td>/g;
            const result = str.match(test).map((match: any) => match.slice(1, -5));
            return (result && result.length) >= 2 ? result : null;
        }

        describe('unescaping angle brackets and htmlescaping the whole value', () => {
            const tooltipFn = generateTooltipFn(viewByAttribute, 'column');

            it('should keep &lt; and &gt; untouched (unescape -> escape)', () => {
                const tooltip = tooltipFn({
                    ...pointData,
                    series: {
                        name: '&lt;series&gt;'
                    }
                });
                expect(getValues(tooltip)).toEqual(['Department', 'category', '&lt;series&gt;', ' 1']);
            });

            it('should escape other html chars in series name and have output properly escaped', () => {
                const tooltip = tooltipFn({
                    ...pointData,
                    series: {
                        name: '"&\'&lt;'
                    }
                });
                expect(getValues(tooltip)).toEqual(['Department', 'category', '&quot;&amp;&#39;&lt;', ' 1']);
            });

            it('should unescape brackets and htmlescape category', () => {
                const tooltip = tooltipFn({
                    ...pointData,
                    category: {
                        name: '&gt;"&\'&lt;'
                    }
                });
                expect(getValues(tooltip)).toEqual(['Department', '&gt;&quot;&amp;&#39;&lt;', 'series', ' 1']);
            });
        });

        it('should render correct values in usecase of bar chart without attribute', () => {
            const tooltipFn = generateTooltipFn(null, 'column');
            const tooltip = tooltipFn(pointData);
            expect(getValues(tooltip)).toEqual(['series', ' 1']);
        });

        it('should render correct values in usecase of pie chart with an attribute', () => {
            const tooltipFn = generateTooltipFn(viewByAttribute, 'pie');
            const tooltip = tooltipFn(pointData);
            expect(getValues(tooltip)).toEqual(['Department', 'category', 'series', ' 1']);
        });

        it('should render correct values in usecase of pie chart with measures', () => {
            const tooltipFn = generateTooltipFn(null, 'pie');
            const tooltip = tooltipFn(pointData);
            expect(getValues(tooltip)).toEqual(['point', ' 1']);
        });

        it('should render correct values in usecase of treemap chart with an attribute', () => {
            const tooltipFn = generateTooltipFn(viewByAttribute, 'treemap');
            const tooltip = tooltipFn(pointData);
            expect(getValues(tooltip)).toEqual(['Department', 'category', 'series', ' 1']);
        });

        it('should render correct values in usecase of treemap chart with measures', () => {
            const tooltipFn = generateTooltipFn(null, 'treemap');
            const tooltip = tooltipFn(pointData);
            expect(getValues(tooltip)).toEqual(['point', ' 1']);
        });
    });

    describe('generateTooltipXYFn', () => {
        const dataSet = fixtures.bubbleChartWith3MetricsAndAttribute;
        const { measureGroup, stackByAttribute } = getMVS(dataSet);

        const point: IPoint = {
            value: 300,
            name: 'point name',
            x: 10,
            y: 20,
            z: 30,
            series: {
                name: 'serie name',
                userOptions: {
                    dataLabels: {
                        formatGD: 'abcd'
                    }
                }
            }
        };
        it('should generate valid tooltip for no measures', () => {
            const measures: any[] = [];
            const expectedResult =
            `<table class=\"tt-values gd-viz-tooltip-table\"><tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">Sales Rep</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">point name</td>
            </tr></table>`;

            const tooltipFn = generateTooltipXYFn(measures, stackByAttribute);
            expect(tooltipFn(point)).toEqual(expectedResult);
        });

        it('should generate valid tooltip for 1 measure', () => {
            const measures = [measureGroup.items[0]];
            const expectedResult =
            `<table class=\"tt-values gd-viz-tooltip-table\"><tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">Sales Rep</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">point name</td>
            </tr>\n<tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">_Snapshot [EOP-2]</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">10.00</td>
            </tr></table>`;

            const tooltipFn = generateTooltipXYFn(measures, stackByAttribute);
            expect(tooltipFn(point)).toEqual(expectedResult);
        });

        it('should generate valid tooltip for 2 measures', () => {
            const measures = [measureGroup.items[0], measureGroup.items[1]];
            const expectedResult =
            `<table class=\"tt-values gd-viz-tooltip-table\"><tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">Sales Rep</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">point name</td>
            </tr>\n<tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">_Snapshot [EOP-2]</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">10.00</td>
            </tr>\n<tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\"># of Open Opps.</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">20</td>
            </tr></table>`;

            const tooltipFn = generateTooltipXYFn(measures, stackByAttribute);
            expect(tooltipFn(point)).toEqual(expectedResult);
        });

        it('should generate valid tooltip for 3 measures', () => {
            const measures = [measureGroup.items[0], measureGroup.items[1], measureGroup.items[2]];
            const expectedResult =
            `<table class=\"tt-values gd-viz-tooltip-table\"><tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">Sales Rep</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">point name</td>
            </tr>\n<tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">_Snapshot [EOP-2]</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">10.00</td>
            </tr>\n<tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\"># of Open Opps.</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">20</td>
            </tr>\n<tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">Remaining Quota</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">$30.00</td>
            </tr></table>`;

            const tooltipFn = generateTooltipXYFn(measures, stackByAttribute);
            expect(tooltipFn(point)).toEqual(expectedResult);
        });

        it('should generate valid tooltip for point without name using name of serie', () => {
            const measures = [measureGroup.items[0], measureGroup.items[1], measureGroup.items[2]];
            const pointWithoutName = cloneDeep(point);
            pointWithoutName.name = undefined;

            const expectedResult =
            `<table class=\"tt-values gd-viz-tooltip-table\"><tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">Sales Rep</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">serie name</td>
            </tr>\n<tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">_Snapshot [EOP-2]</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">10.00</td>
            </tr>\n<tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\"># of Open Opps.</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">20</td>
            </tr>\n<tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">Remaining Quota</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">$30.00</td>
            </tr></table>`;

            const tooltipFn = generateTooltipXYFn(measures, stackByAttribute);
            expect(tooltipFn(pointWithoutName)).toEqual(expectedResult);
        });
    });

    describe('generateTooltipTreemapFn', () => {
        const point: IPoint = {
            category: {
                name: 'category'
            },
            value: 300,
            name: 'point name',
            x: 0,
            y: 0,
            series: {
                name: 'serie name',
                userOptions: {
                    dataLabels: {
                        formatGD: 'abcd'
                    }
                }
            }
        };
        it('should generate valid tooltip for 1 measure', () => {
            const expectedResult =
            `<table class=\"tt-values gd-viz-tooltip-table\"><tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">category</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">300</td>
            </tr></table>`;

            const tooltipFn = generateTooltipTreemapFn(null, null);
            expect(tooltipFn(point)).toEqual(expectedResult);
        });

        it('should respect measure format', () => {
            const pointWithFormat = cloneDeep(point);
            pointWithFormat.format = 'abcd';
            const expectedResult =
            `<table class=\"tt-values gd-viz-tooltip-table\"><tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">category</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">abcd</td>
            </tr></table>`;

            const tooltipFn = generateTooltipTreemapFn(null, null);
            expect(tooltipFn(pointWithFormat)).toEqual(expectedResult);
        });

        it('should generate valid tooltip for 1 measure and view by', () => {
            const dataSet = fixtures.treemapWithMetricAndViewByAttribute;
            const { viewByAttribute, stackByAttribute } = getMVSTreemap(dataSet);
            const expectedResult =
            `<table class=\"tt-values gd-viz-tooltip-table\"><tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">Department</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">Direct Sales</td>
            </tr>\n<tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">serie name</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">300</td>
            </tr></table>`;

            const tooltipFn = generateTooltipTreemapFn(viewByAttribute, stackByAttribute);
            expect(tooltipFn(point)).toEqual(expectedResult);
        });

        it('should generate valid tooltip for 1 measure and stack by', () => {
            const dataSet = fixtures.treemapWithMetricAndStackByAttribute;
            const { viewByAttribute, stackByAttribute } = getMVSTreemap(dataSet);
            const expectedResult =
            `<table class=\"tt-values gd-viz-tooltip-table\"><tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">Department</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">Direct Sales</td>
            </tr>\n<tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">category</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">300</td>
            </tr></table>`;

            const tooltipFn = generateTooltipTreemapFn(viewByAttribute, stackByAttribute);
            expect(tooltipFn(point)).toEqual(expectedResult);
        });

        it('should generate valid tooltip for 1 measure, view by and stack by', () => {
            const dataSet = fixtures.treemapWithMetricViewByAndStackByAttribute;
            const { viewByAttribute, stackByAttribute } = getMVSTreemap(dataSet);
            const expectedResult =
            `<table class=\"tt-values gd-viz-tooltip-table\"><tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">Department</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">Direct Sales</td>
            </tr>\n<tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">Region</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">West Coast</td>
            </tr>\n<tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">serie name</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">300</td>
            </tr></table>`;

            const tooltipFn = generateTooltipTreemapFn(viewByAttribute, stackByAttribute);
            expect(tooltipFn(point)).toEqual(expectedResult);
        });
    });

    describe('getChartOptions', () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;
        const dataSetWithoutMeasureGroup = immutableSet(dataSet,
            `executionResponse.dimensions[${STACK_BY_DIMENSION_INDEX}].headers`, []);
        const chartOptionsWithCustomOptions = generateChartOptions(dataSet, {
            xLabel: 'xLabel',
            yLabel: 'yLabel',
            yFormat: 'yFormat',
            type: 'line',
            legendLayout: 'vertical'
        });

        it('should throw if measure group is missing in dimensions', () => {
            expect(generateChartOptions.bind(this, dataSetWithoutMeasureGroup)).toThrow();
        });

        it('should throw if chart type is of unknown type', () => {
            expect(generateChartOptions.bind(this, dataSetWithoutMeasureGroup, { type: 'bs' })).toThrow();
        });

        it('should assign format from first measure which format includes a "%" sign', () => {
            const expectedPercentageFormat = '0.00 %';
            const expectedNormalFormat = get(dataSet, `executionResponse.dimensions[${STACK_BY_DIMENSION_INDEX}]` +
                'headers[0].measureGroupHeader.items[1].measureHeaderItem.format');
            const dataSetWithPercentFormat = immutableSet(dataSet,
                `executionResponse.dimensions[${STACK_BY_DIMENSION_INDEX}]` +
                'headers[0].measureGroupHeader.items[1].measureHeaderItem.format',
                '0.00 %');
            const chartOptions = generateChartOptions(dataSetWithPercentFormat);
            // first measure format by default
            expect(generateChartOptions(dataSet).yAxes[0].format).toBe(expectedNormalFormat);
            // if measure format including %
            expect(chartOptions.yAxes[0].format).toBe(expectedPercentageFormat);
        });

        it('should assign custom legend format', () => {
            expect(chartOptionsWithCustomOptions.legendLayout).toBe('vertical');
        });

        it('should enable grid', () => {
            expect(chartOptionsWithCustomOptions.grid.enabled).toBe(true);
        });

        it('should disable grid', () => {
            const chartOptions = generateChartOptions(dataSet, { grid: { enabled: false }, type: 'line' });
            expect(chartOptions.grid.enabled).toEqual(false);
        });

        describe('in usecase of bar chart with 3 metrics', () => {
            const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute);

            it('should assign a default legend format of horizontal', () => {
                expect(chartOptions.legendLayout).toBe('horizontal');
            });

            it('should assign stacking option to null', () => {
                expect(chartOptions.stacking).toBe(null);
            });

            it('should assign number of series equal to number of measures', () => {
                expect(chartOptions.data.series.length).toBe(3);
            });

            it('should assign categories equal to view by attribute values', () => {
                expect(chartOptions.data.categories).toEqual(['<button>2008</button>', '2009', '2010', '2011', '2012']);
            });

            it('should assign 3 colors from default colorPalette', () => {
                const seriesColors = chartOptions.data.series.map((serie: any) => serie.color);
                expect(seriesColors).toEqual(
                    DEFAULT_COLOR_PALETTE.slice(0, 3)
                        .map((defaultColor: IColorPaletteItem) => getRgbString(defaultColor))
                );
            });

            it('should assign correct tooltip function', () => {
                const { viewByAttribute } = getMVS(dataSet);
                const pointData = {
                    y: 1,
                    format: '# ###',
                    name: 'point',
                    category: {
                        name: 'category'
                    },
                    series: {
                        name: 'series'
                    }
                };
                const tooltip = chartOptions.actions.tooltip(pointData);
                const expectedTooltip = generateTooltipFn(viewByAttribute, 'column')(pointData);
                expect(tooltip).toBe(expectedTooltip);
            });
        });

        describe('in usecase of stack bar chart', () => {
            const chartOptions = generateChartOptions(fixtures.barChartWithStackByAndViewByAttributes);

            it('should assign stacking normal', () => {
                expect(chartOptions.stacking).toBe('normal');
            });

            it('should assign number of series equal to number of stack by attribute values', () => {
                expect(chartOptions.data.series.length).toBe(2);
            });

            it('should assign categories equal to view by attribute values', () => {
                expect(chartOptions.data.categories).toEqual(['Direct Sales', 'Inside Sales']);
            });

            it('should assign correct tooltip function', () => {
                const { viewByAttribute } = getMVS(fixtures.barChartWithStackByAndViewByAttributes);
                const pointData = {
                    y: 1,
                    format: '# ###',
                    name: 'point',
                    category: {
                        name: 'category'
                    },
                    series: {
                        name: 'series'
                    }
                };
                const tooltip = chartOptions.actions.tooltip(pointData);
                const expectedTooltip = generateTooltipFn(viewByAttribute, 'column')(pointData);
                expect(tooltip).toBe(expectedTooltip);
            });
        });

        describe('in usecase of pie chart and treemap with attribute', () => {
            const pieChartOptions = generateChartOptions(
                fixtures.barChartWithViewByAttribute,
                { type: 'pie' }
            );
            const treemapOptions = generateChartOptions(
                fixtures.treemapWithMetricAndViewByAttribute,
                {
                    type: 'treemap',
                    mdObject: fixtures.treemapWithMetricAndViewByAttribute.mdObject
                }
            );

            it('should assign stacking normal', () => {
                expect(pieChartOptions.stacking).toBe(null);
                expect(treemapOptions.stacking).toBe(null);
            });

            it('should always assign 1 series', () => {
                expect(pieChartOptions.data.series.length).toBe(1);
                expect(treemapOptions.data.series.length).toBe(1);
            });

            it('should assign categories equal to view by attribute values', () => {
                expect(pieChartOptions.data.categories).toEqual(['Direct Sales', 'Inside Sales']);
                expect(treemapOptions.data.categories).toEqual(['Direct Sales', 'Inside Sales']);
            });

            it('should assign correct tooltip function', () => {
                const { viewByAttribute } = getMVS(fixtures.barChartWithStackByAndViewByAttributes);
                const pointData = {
                    x: 0,
                    y: 1,
                    format: '# ###',
                    name: 'point',
                    category: {
                        name: 'category'
                    },
                    series: {
                        name: 'series'
                    }
                };

                let expectedTooltip = generateTooltipFn(viewByAttribute, 'column')(pointData);

                const pieChartTooltip = pieChartOptions.actions.tooltip(pointData);
                expect(pieChartTooltip).toBe(expectedTooltip);

                expectedTooltip = generateTooltipTreemapFn(viewByAttribute, null)(pointData);

                const treemapTooltip = treemapOptions.actions.tooltip(pointData);
                expect(treemapTooltip).toBe(expectedTooltip);
            });
        });

        describe('in usecase of pie chart and treemap with measures only', () => {
            const pieChartOptions = generateChartOptions(fixtures.pieChartWithMetricsOnly, { type: 'pie' });
            const treemapOptions = generateChartOptions(fixtures.pieChartWithMetricsOnly, { type: 'treemap' });

            it('should assign stacking normal', () => {
                expect(pieChartOptions.stacking).toBe(null);
                expect(treemapOptions.stacking).toBe(null);
            });

            it('should always assign 1 series', () => {
                expect(pieChartOptions.data.series.length).toBe(1);
                expect(treemapOptions.data.series.length).toBe(1);
            });

            it('should assign categories with names of measures', () => {
                expect(pieChartOptions.data.categories).toEqual(['Won', 'Lost', 'Expected']);
                expect(treemapOptions.data.categories).toEqual(['Lost', 'Won', 'Expected']);
            });

            it('should assign correct tooltip function', () => {
                const pointData = {
                    y: 1,
                    format: '# ###',
                    name: 'point',
                    category: {
                        name: 'category'
                    },
                    series: {
                        name: 'series'
                    },
                    value: 2
                };

                const expectedPieChartTooltip = generateTooltipFn(null, 'pie')(pointData);
                const pieChartTooltip = pieChartOptions.actions.tooltip(pointData);
                expect(pieChartTooltip).toBe(expectedPieChartTooltip);

                const expectedTreemapTooltip = generateTooltipTreemapFn(null, null)(pointData);
                const treemapTooltip = treemapOptions.actions.tooltip(pointData);
                expect(treemapTooltip).toBe(expectedTreemapTooltip);
            });
        });

        describe('in usecase of bar chart with pop measure', () => {
            const chartOptions =
                generateChartOptions(fixtures.barChartWithPopMeasureAndViewByAttribute, { type: 'column' });

            it('should assign stacking normal', () => {
                expect(chartOptions.stacking).toBe(null);
            });

            it('should always assign number of series equal to number of measures', () => {
                expect(chartOptions.data.series.length).toBe(2);
            });

            it('should assign categories ', () => {
                expect(chartOptions.data.categories).toEqual(['2008', '2009', '2010', '2011', '2012', '2013']);
            });

            it('should assign updated color for pop measure', () => {
                expect(chartOptions.data.series[0].color).toEqual('rgb(161,224,243)');
                expect(chartOptions.data.series[1].color).toEqual('rgb(20,178,226)');
            });

            it('should assign correct tooltip function for pop measure', () => {
                const { viewByAttribute } = getMVS(fixtures.barChartWithPopMeasureAndViewByAttribute);
                const pointData = {
                    y: 1,
                    format: '# ###',
                    name: 'point',
                    category: {
                        name: 'category'
                    },
                    series: {
                        name: 'series'
                    }
                };
                const tooltip = chartOptions.actions.tooltip(pointData);
                const expectedTooltip = generateTooltipFn(viewByAttribute, 'column')(pointData);
                expect(tooltip).toBe(expectedTooltip);
            });

            it('should assign correct tooltip function for previous period measure', () => {
                const { viewByAttribute } = getMVS(fixtures.barChartWithPreviousPeriodMeasure);
                const pointData = {
                    y: 1,
                    format: '# ###',
                    name: 'point',
                    category: {
                        name: 'category'
                    },
                    series: {
                        name: 'series'
                    }
                };
                const tooltip = chartOptions.actions.tooltip(pointData);
                const expectedTooltip = generateTooltipFn(viewByAttribute, 'column')(pointData);
                expect(tooltip).toBe(expectedTooltip);
            });
        });

        describe('in usecase of stacked area chart', () => {
            it('should assign stacking normal', () => {
                const chartOptions = generateChartOptions(fixtures.areaChartWith3MetricsAndViewByAttribute,
                    { type: 'area' });
                expect(chartOptions.stacking).toBe('normal');
            });

            it('should disable stacking by config', () => {
                const chartOptions = generateChartOptions(
                    fixtures.areaChartWith3MetricsAndViewByAttribute,
                    {
                        type: 'area',
                        stacking: false
                    }
                );

                expect(chartOptions.stacking).toBeNull();
            });

            it('should enable stacking by config', () => {
                const chartOptions = generateChartOptions(
                    fixtures.areaChartWith3MetricsAndViewByAttribute,
                    {
                        type: 'area',
                        stacking: true
                    }
                );

                expect(chartOptions.stacking).toBe('normal');
            });

            it('should disable stacking by config even with stack by attribute', () => {
                const chartOptions = generateChartOptions(
                    fixtures.areaChartWithMeasureViewByAndStackBy,
                    {
                        type: 'area',
                        stacking: false
                    }
                );

                expect(chartOptions.stacking).toBeNull();
            });
        });

        describe('in usecase of combo chart', () => {
            it('should assign `line` type to second serie according mbObject', () => {
                const chartOptions = generateChartOptions(
                    fixtures.comboWithTwoMeasuresAndViewByAttribute,
                    {
                        type: 'combo',
                        mdObject: fixtures.comboWithTwoMeasuresAndViewByAttributeMdObject
                    }
                );

                expect(chartOptions.data.series[0].type).toBe('column');
                expect(chartOptions.data.series[1].type).toBe('line');
            });

            it('should handle missing mbObject', () => {
                const chartOptions = generateChartOptions(
                    fixtures.comboWithTwoMeasuresAndViewByAttribute,
                    {
                        type: 'combo'
                    }
                );

                expect(chartOptions.data.series[0].type).toBeUndefined();
                expect(chartOptions.data.series[1].type).toBeUndefined();
            });

            it('should assign format from first measure whichs format includes a "%" sign', () => {
                const dataSet = fixtures.comboWithTwoMeasuresAndViewByAttribute;
                const expectedPercentageFormat = '0.00 %';
                const expectedNormalFormat = get(dataSet, `executionResponse.dimensions[${STACK_BY_DIMENSION_INDEX}]` +
                    'headers[0].measureGroupHeader.items[1].measureHeaderItem.format');

                const dataSetWithPercentFormat = immutableSet(dataSet,
                    `executionResponse.dimensions[${STACK_BY_DIMENSION_INDEX}]` +
                    'headers[0].measureGroupHeader.items[1].measureHeaderItem.format',
                    '0.00 %');
                const chartOptions = generateChartOptions(
                    dataSetWithPercentFormat,
                    {
                        type: 'combo'
                    });
                // first measure format by default
                expect(generateChartOptions(dataSet).yAxes[0].format).toBe(expectedNormalFormat);
                // if measure format includes %
                expect(chartOptions.yAxes[0].format).toBe(expectedPercentageFormat);
            });
        });

        describe('generate Y axes', () => {
            it('should generate one axis with no label when there are more measures and in bar chart', () => {
                const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute);
                const expectedAxes = [{
                    label: '',
                    format: '#,##0.00',
                    seriesIndices: [0, 1, 2]
                }];
                expect(chartOptions.yAxes).toEqual(expectedAxes);
            });

            it('should generate one axis with first measure label when there is one measure and in bar chart', () => {
                const chartOptions = generateChartOptions(fixtures.barChartWithSingleMeasureAndNoAttributes);
                const expectedAxes = [{
                    label: 'Amount',
                    format: '#,##0.00',
                    seriesIndices: [0]
                }];
                expect(chartOptions.yAxes).toEqual(expectedAxes);
            });
        });

        describe('generate X axes', () => {
            it('should generate one axis with attribute label', () => {
                const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute);
                const expectedAxes = [{
                    label: 'Year created'
                }];
                expect(chartOptions.xAxes).toEqual(expectedAxes);
            });

            it('should generate one axis with no label if primary measures are empty for scatter plot', () => {
                const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute, {
                    type: 'scatter',
                    mdObject: {
                        buckets: [
                            { localIdentifier: 'measures', items: [] },
                            { localIdentifier: 'secondary_measures', items: [{}] }
                        ]
                    }
                });
                const expectedAxes = [{
                    label: ''
                }];

                expect(chartOptions.xAxes).toEqual(expectedAxes);
            });

            it('should generate one axis with label from primary measures for scatter plot', () => {
                const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute, {
                    type: 'scatter',
                    mdObject: {
                        buckets: [
                            { localIdentifier: 'measures', items: [{}] },
                            { localIdentifier: 'secondary_measures', items: [] }
                        ]
                    }
                });
                const expectedAxes = [{
                    label: '<button>Lost</button> ...',
                    format: '#,##0.00'
                }];

                expect(chartOptions.xAxes).toEqual(expectedAxes);
            });

            it('should generate one axis with no label if primary measures are empty for bubble chart', () => {
                const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute, {
                    type: 'bubble',
                    mdObject: {
                        buckets: [
                            { localIdentifier: 'measures', items: [] },
                            { localIdentifier: 'secondary_measures', items: [{}] },
                            { localIdentifier: 'tertiary_measures', items: [{}] }
                        ]
                    }
                });
                const expectedAxes = [{
                    label: ''
                }];

                expect(chartOptions.xAxes).toEqual(expectedAxes);
            });

            it('should generate one axis with label from primary measure for bubble chart', () => {
                const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute, {
                    type: 'bubble',
                    mdObject: {
                        buckets: [
                            { localIdentifier: 'measures', items: [{}] },
                            { localIdentifier: 'secondary_measures', items: [] },
                            { localIdentifier: 'tertiary_measures', items: [] }
                        ]
                    }
                });
                const expectedAxes = [{
                    label: '<button>Lost</button> ...',
                    format: '#,##0.00'
                }];

                expect(chartOptions.xAxes).toEqual(expectedAxes);
            });
        });

        describe('Bubble chart configuration', () => {
            it('Should generate series from attribute elements', () => {
                const chartOptions = generateChartOptions(fixtures.bubbleChartWith3MetricsAndAttribute, {
                    type: 'bubble',
                    mdObject: fixtures.bubbleChartWith3MetricsAndAttributeMd.mdObject
                });

                expect(chartOptions.data.series.length).toEqual(20);
            });

            it('should flip axis if primary measure bucket is empty', () => {
                const customMdObject = cloneDeep(fixtures.bubbleChartWith3MetricsAndAttributeMd.mdObject);
                customMdObject.buckets[0].items = [];
                const chartOptions = generateChartOptions(fixtures.bubbleChartWith3MetricsAndAttribute, {
                    type: 'bubble',
                    mdObject: customMdObject
                });

                expect(chartOptions.data.series[0].data[0].x).toEqual(0);
            });

            it('Should generate correct axes', () => {
                const chartOptions = generateChartOptions(fixtures.bubbleChartWith3MetricsAndAttribute, {
                    type: 'bubble',
                    mdObject: fixtures.bubbleChartWith3MetricsAndAttributeMd.mdObject
                });

                expect(chartOptions.xAxes.length).toEqual(1);
                expect(chartOptions.yAxes.length).toEqual(1);
                expect(chartOptions.xAxes[0].label).toEqual('_Snapshot [EOP-2]');
                expect(chartOptions.yAxes[0].label).toEqual('# of Open Opps.');
            });
        });

        describe('Heatmap configuration', () => {
            describe('generateTooltipHeatmapFn', () => {
                const viewBy = {
                    formOf: { name: 'viewAttr' },
                    items: [{ attributeHeaderItem: { name: 'viewHeader' } }]
                };

                const stackBy = {
                    formOf: { name: 'stackAttr' },
                    items: [{ attributeHeaderItem: { name: 'stackHeader' } }]
                };

                const point = {
                    value: 300,
                    x: 0,
                    y: 0,
                    series: {
                        name: 'name',
                        userOptions: {
                            dataLabels: {
                                formatGD: 'abcd'
                            }
                        }
                    }
                };

                it('should generate correct tooltip', () => {
                    const tooltipFn = generateTooltipHeatmapFn(viewBy, stackBy);
                    const expectedResult =
            `<table class=\"tt-values gd-viz-tooltip-table\"><tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">stackAttr</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">stackHeader</td>
            </tr>\n<tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">viewAttr</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">viewHeader</td>
            </tr>\n<tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">name</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">abcd</td>
            </tr></table>`;

                    expect(tooltipFn(point)).toEqual(expectedResult);
                });

                it('should display "-" for null value', () => {
                    const tooltipValue = generateTooltipHeatmapFn(viewBy, stackBy)({
                        ...point,
                        value: null
                    });
                    const expectedResult =
            `<table class=\"tt-values gd-viz-tooltip-table\"><tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">stackAttr</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">stackHeader</td>
            </tr>\n<tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">viewAttr</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">viewHeader</td>
            </tr>\n<tr class=\"gd-viz-tooltip-table-row\">
                <td class=\"gd-viz-tooltip-table-cell title gd-viz-tooltip-table-title\">name</td>
                <td class=\"gd-viz-tooltip-table-cell value gd-viz-tooltip-table-value\">-</td>
            </tr></table>`;

                    expect(tooltipValue).toEqual(expectedResult);
                });
            });

            describe('getChartOptions for heatmap', () => {
                it('should generate correct series with enabled data labels', () => {
                    const chartOptions = generateChartOptions(
                        fixtures.barChartWithStackByAndViewByAttributes,
                        {
                            type: 'heatmap',
                            stacking: false
                        }
                    );
                    const expectedSeries = [{
                        data: [
                            { x: 0, y: 0, value: 21978695.46, drilldown: false },
                            { x: 1, y: 0, value: 6038400.96, drilldown: false },
                            { x: 0, y: 1, value: 58427629.5, drilldown: false },
                            { x: 1, y: 1, value: 30180730.62, drilldown: false }
                        ],
                        dataLabels: {
                            formatGD: '#,##0.00'
                        },
                        legendIndex: 0,
                        name: 'Amount',
                        turboThreshold: 0,
                        yAxis: 0,
                        isDrillable: false
                    }];

                    expect(chartOptions.data.series).toEqual(expectedSeries);
                });

                it('should generate valid categories', () => {
                    const chartOptions = generateChartOptions(
                        fixtures.barChartWithStackByAndViewByAttributes,
                        {
                            type: 'heatmap',
                            stacking: false
                        }
                    );

                    const expectedCategories = [['Direct Sales', 'Inside Sales'], ['East Coast', 'West Coast']];

                    expect(chartOptions.data.categories).toEqual(expectedCategories);
                });

                it('should generate categories with empty strings', () => {
                    const chartOptions = generateChartOptions(
                        fixtures.barChartWithSingleMeasureAndNoAttributes,
                        {
                            type: 'heatmap',
                            stacking: false
                        }
                    );
                    const expectedCategories = [[''], ['']];
                    expect(chartOptions.data.categories).toEqual(expectedCategories);
                });

                it('should generate Yaxes without format from measure', () => {
                    const chartOptions = generateChartOptions(
                        fixtures.barChartWithStackByAndViewByAttributes,
                        {
                            type: 'heatmap'
                        }
                    );
                    const expectedYAxis = [{
                        label: 'Region'
                    }];
                    expect(chartOptions.yAxes).toEqual(expectedYAxis);
                });

                it('should generate Yaxes label from attribute name', () => {
                    const chartOptions = generateChartOptions(
                        fixtures.heatmapMetricRowColumn,
                        {
                            type: 'heatmap'
                        }
                    );
                    const expectedYAxis = [{
                        label: 'Product'
                    }];
                    expect(chartOptions.yAxes).toEqual(expectedYAxis);
                });

                describe('getHeatmapDataClasses', () => {
                    const emptyExecutionResult: Execution.IExecutionResponse = {
                        dimensions: [
                            {
                                headers: [
                                    {
                                        measureGroupHeader: {
                                            items: []
                                        }
                                    }
                                ]
                            }
                        ],
                        links: {
                            executionResult: ''
                        }
                    };

                    it('should return empty array when there are no values in series', () => {
                        const series = [{ data: [{ value: null as any }] }];
                        const expectedDataClasses: Highcharts.ColorAxisDataClass[] = [];
                        const dataClasses = getHeatmapDataClasses(
                            series,
                            {} as any as IColorStrategy
                        );

                        expect(dataClasses).toEqual(expectedDataClasses);
                    });

                    it('should return single dataClass when series have only one value', () => {
                        const series = [{
                            data: [{
                                value: 10
                            }]
                        }];

                        const expectedDataClasses = [
                            {
                                from: 10,
                                to: 10,
                                color: 'rgb(197,236,248)'
                            }
                        ];
                        const dataClasses = getHeatmapDataClasses(
                            series,
                            new HeatmapColorStrategy(null, null, null, null, emptyExecutionResult, null)
                        );

                        expect(dataClasses).toEqual(expectedDataClasses);
                    });

                    it('should return 7 data classes with valid color', () => {
                        const series = [{
                            data: [{
                                    value: 0
                                }, {
                                    value: 20
                                }, {
                                    value: 30
                            }]
                        }];
                        const approximatelyExpectedDataClasses = [
                            {
                                from: 0,
                                color: 'rgb(255,255,255)'
                            }, {
                                color: 'rgb(197,236,248)'
                            }, {
                                color: 'rgb(138,217,241)'
                            }, {
                                color: 'rgb(79,198,234)'
                            }, {
                                color: 'rgb(20,178,226)'
                            }, {
                                color: 'rgb(22,151,192)'
                            }, {
                                to: 30,
                                color: 'rgb(0,110,145)'
                            }
                        ];
                        const dataClasses = getHeatmapDataClasses(
                            series,
                            new HeatmapColorStrategy(null, null, null, null, emptyExecutionResult, null)
                        );

                        expect(dataClasses).toMatchObject(approximatelyExpectedDataClasses);
                    });
                });
            });
        });

        describe('dual axes', () => {
            const config = {
                type: 'column',
                secondary_yaxis: {
                    measures: ['wonMetric']
                }
            };

            const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute, config);
            it('should generate right Y axis with correct properties', () => {
                const expectedAxes = [{
                    label: '', // axis label must be empty with 2 metrics
                    format: '#,##0.00',
                    opposite: false,
                    seriesIndices: [0, 2]
                }, {
                    label: 'Won', // axis label must present with 1 metric
                    format: '#,##0.00',
                    opposite: true,
                    seriesIndices: [1]
                }];
                expect(chartOptions.yAxes).toEqual(expectedAxes);
            });

            it('should generate right y series with correct yAxis value', () => {
                const expectedYAxisValues = [0, 1, 0]; // Left: Lost, Expected and Right: Won
                const yAxisValues = chartOptions.data.series.map(({ yAxis }: any) => yAxis);
                expect(yAxisValues).toEqual(expectedYAxisValues);
            });

            it('should generate % format for both Y axes ', () => {
                const dataSet = cloneDeep(fixtures.barChartWith3MetricsAndViewByAttribute);
                const measureItems = dataSet.executionResponse.dimensions[0].headers[0].measureGroupHeader.items;
                measureItems.forEach((item: any) => {
                    item.measureHeaderItem.format += '%';
                });

                const chartOptions = generateChartOptions(dataSet, config);
                const formatValues = chartOptions.yAxes.map(({ format }: any) => format);
                expect(formatValues).toEqual(['#,##0.00%', '#,##0.00%']);
            });

            it('should generate % format for right Y axis ', () => {
                const dataSet = cloneDeep(fixtures.barChartWith3MetricsAndViewByAttribute);
                const measureItems = dataSet.executionResponse.dimensions[0].headers[0].measureGroupHeader.items;
                measureItems[1].measureHeaderItem.format += '%';

                const chartOptions = generateChartOptions(dataSet, config);
                const formatValues = chartOptions.yAxes.map(({ format }: any) => format);
                expect(formatValues).toEqual(['#,##0.00', '#,##0.00%']);
            });

            it('should generate one right Y axis', () => {
                const config = {
                    type: 'column',
                    secondary_yaxis: {
                        measures: ['lostMetric', 'expectedMetric', 'wonMetric']
                    }
                };
                const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute, config);

                const expectedAxis = [{
                    label: '', // axis label must be empty with 3 metrics
                    format: '#,##0.00',
                    opposite: true,
                    seriesIndices: [0, 1, 2]
                }];
                expect(chartOptions.yAxes).toEqual(expectedAxis);
            });
        });

        describe('optional stacking', () => {
            it('should return grouped categories with viewing by 2 attributes', () => {
                const {
                    data: {
                        categories
                    },
                    isViewByTwoAttributes
                } = generateChartOptions(fixtures.barChartWith4MetricsAndViewBy2Attribute);

                expect(isViewByTwoAttributes).toBeTruthy();
                expect(categories).toEqual([{
                    name: 'Direct Sales',
                    categories: ['East Coast', 'West Coast']
                }, {
                    name: 'Inside Sales',
                    categories: ['East Coast', 'West Coast']
                }]);
            });

            it('should not return grouped categories with viewing by one attribute', () => {
                const {
                    data: {
                        categories
                    },
                    isViewByTwoAttributes
                } = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute);

                expect(isViewByTwoAttributes).toBeFalsy();
                expect(categories).toEqual(['<button>2008</button>', '2009', '2010', '2011', '2012']);
            });

            it.each`
                description | config
                ${'undefined'} | ${undefined}
                ${'false'} | ${{ stackMeasures: false, stackMeasuresToPercent: false }}
            `('should return \'undefined\' stacking with stack options are $description', (
                { config }: {config: any}
            ) => {
                const { stacking } = generateChartOptions(
                    fixtures.barChartWith3MetricsAndViewByAttribute,
                    {
                        type: VisualizationTypes.COLUMN,
                        ...config
                    }
                );
                expect(stacking).toBeFalsy();
            });

            it.each`
                description | config | expectation
                ${'should return \'normal\' stacking'} | ${{ stackMeasures: true }} | ${NORMAL_STACK}
                ${'should return \'percent\' stacking'} | ${{ stackMeasuresToPercent: true }} | ${PERCENT_STACK}
                ${'should \'percent\' overwrite \'normal\' stacking'} |
                    ${{ stackMeasures: true, stackMeasuresToPercent: true }} | ${PERCENT_STACK}
            `('$description', ({ config, expectation }: {config: any, expectation: string}) => {
                const { stacking } = generateChartOptions(
                    fixtures.barChartWith3MetricsAndViewByAttribute,
                    {
                        type: VisualizationTypes.COLUMN,
                        ...config
                    }
                );
                expect(stacking).toBe(expectation);
            });

            describe('getCategoriesForTwoAttributes', () => {
                const viewByAttribute: IUnwrappedAttributeHeadersWithItems = {
                    uri: '/uri',
                    identifier: '5.df',
                    localIdentifier: 'a2',
                    name: 'Status',
                    formOf: {
                        uri: '/gdc/md/storybook/obj/5',
                        identifier: '5',
                        name: 'Status'
                    },
                    items: [{
                        attributeHeaderItem: {
                            uri: '/gdc/md/storybook/obj/5/elements?id=1',
                            name: 'Won'
                        }
                    }, {
                        attributeHeaderItem: {
                            uri: '/gdc/md/storybook/obj/5/elements?id=2',
                            name: 'Lost'
                        }
                    }, {
                        attributeHeaderItem: {
                            uri: '/gdc/md/storybook/obj/5/elements?id=1',
                            name: 'Won'
                        }
                    }, {
                        attributeHeaderItem: {
                            uri: '/gdc/md/storybook/obj/5/elements?id=2',
                            name: 'Lost'
                        }
                    }]
                };
                const viewByTwoAttributes: IViewByTwoAttributes = {
                    items: [{
                        attributeHeaderItem: {
                            uri: '/gdc/md/storybook/obj/4/elements?id=1',
                            name: 'Department'
                        }
                    }]
                };

                it('should return categories for two attributes', () => {
                    const categories = getCategoriesForTwoAttributes(viewByAttribute, viewByTwoAttributes);
                    expect(categories).toEqual([{
                        name: 'Department',
                        categories: ['Won', 'Lost']
                    }]);
                });

                it('should return empty category', () => {
                    const categories = getCategoriesForTwoAttributes(viewByAttribute, { items: [] });
                    expect(categories).toHaveLength(0);
                });

                it('should only return distinct header names', () => {
                    const attributes  = viewByAttribute.items.reduce(getDistinctAttributeHeaderName, []);
                    expect(attributes).toEqual(['Won', 'Lost']);
                });
            });
        });
    });
});
