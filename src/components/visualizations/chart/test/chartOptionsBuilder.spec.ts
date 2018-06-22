// (C) 2007-2018 GoodData Corporation
import range = require('lodash/range');
import get = require('lodash/get');
import cloneDeep = require('lodash/cloneDeep');
import { immutableSet } from '../../utils/common';
import {
    isNegativeValueIncluded,
    validateData,
    isPopMeasure,
    findInDimensionHeaders,
    findMeasureGroupInDimensions,
    findAttributeInDimension,
    normalizeColorToRGB,
    getColorPalette,
    getSeriesItemData,
    getSeries,
    getDrillContext,
    getDrillableSeries,
    customEscape,
    generateTooltipFn,
    generateTooltipHeatMapFn,
    generateTooltipXYFn,
    generateTooltipTreemapFn,
    IPoint,
    getBubbleChartSeries,
    getHeatMapDataClasses,
    getTreemapAttributes
} from '../chartOptionsBuilder';
import { DEFAULT_CATEGORIES_LIMIT } from '../highcharts/commonConfiguration';
import { generateChartOptions } from './helper';

import * as fixtures from '../../../../../stories/test_data/fixtures';

import {
    PIE_CHART_LIMIT,
    VIEW_BY_DIMENSION_INDEX,
    STACK_BY_DIMENSION_INDEX
} from '../constants';

import {
    DEFAULT_COLOR_PALETTE,
    getLighterColor
} from '../../utils/color';

export { IPoint };

function getMVS(dataSet: any) {
    const {
        executionResponse: { dimensions },
        executionResult: { headerItems }
    } = dataSet;
    const measureGroup = findMeasureGroupInDimensions(dimensions);
    const viewByAttribute = findAttributeInDimension(
        dimensions[VIEW_BY_DIMENSION_INDEX],
        headerItems[VIEW_BY_DIMENSION_INDEX]
    );
    const stackByAttribute = findAttributeInDimension(
        dimensions[STACK_BY_DIMENSION_INDEX],
        headerItems[STACK_BY_DIMENSION_INDEX]
    );
    return [
        measureGroup,
        viewByAttribute,
        stackByAttribute
    ];
}

function getMVSTreemap(dataSet: any) {
    const {
        executionResponse: { dimensions },
        executionResult: { headerItems },
        mdObject
    } = dataSet;
    const measureGroup = findMeasureGroupInDimensions(dimensions);
    const {
        viewByAttribute: treemapViewByAttribute,
        stackByAttribute: treemapStackByAttribute
    } = getTreemapAttributes(
        dimensions,
        headerItems,
        mdObject
    );

    return [
        measureGroup,
        treemapViewByAttribute,
        treemapStackByAttribute
    ];
}

function getSeriesItemDataParameters(dataSet: any, seriesIndex: any) {
    const seriesItem = dataSet.executionResult.data[seriesIndex];
    const mvs = getMVS(dataSet);
    return [
        seriesItem,
        seriesIndex,
        mvs[0],
        mvs[1],
        mvs[2]
    ];
}

describe('chartOptionsBuilder', () => {
    const barChartWithStackByAndViewByAttributesOptions = generateChartOptions();

    const barChartWith3MetricsAndViewByAttributeOptions =
        generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute);

    const pieAndDreemapDataSet = {
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

    const pieChartOptionsWithNegativeValue = generateChartOptions(pieAndDreemapDataSet, { type: 'pie' });

    const treemapOptionsWithNegativeValue = generateChartOptions(pieAndDreemapDataSet, { type: 'treemap' });

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
    });

    describe('isPopMeasure', () => {
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
                isPopMeasure(measureItem, afm)
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
                isPopMeasure(measureItem, afm)
            ).toEqual(false);
        });
    });

    describe('findInDimensionHeaders', () => {
        it('should call supplied callback for all headers in all dimensions until it returns a non null value', () => {
            const mockCallback = jest.fn();
            mockCallback.mockReturnValue(null);
            const sampleDimensions = fixtures.barChartWithStackByAndViewByAttributes.executionResponse.dimensions;
            const headerCount = sampleDimensions[VIEW_BY_DIMENSION_INDEX].headers.length
                + sampleDimensions[STACK_BY_DIMENSION_INDEX].headers.length;
            const returnValue = findInDimensionHeaders(sampleDimensions, mockCallback);
            expect(returnValue).toBeNull();
            expect(mockCallback).toHaveBeenCalledTimes(headerCount);
        });
        it('should return the first non-null value of it`s callback value', () => {
            const mockCallback = jest.fn();
            mockCallback.mockReturnValue(42);
            const sampleDimensions = fixtures.barChartWithStackByAndViewByAttributes.executionResponse.dimensions;
            const returnValue = findInDimensionHeaders(sampleDimensions, mockCallback);
            expect(returnValue).toBe(42);
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });
    });

    describe('findMeasureGroupInDimensions', () => {
        it('should return the measure group header', () => {
            const sampleDimensions = fixtures.barChartWithStackByAndViewByAttributes.executionResponse.dimensions;
            const returnValue = findMeasureGroupInDimensions(sampleDimensions);
            const expectedValue = sampleDimensions[VIEW_BY_DIMENSION_INDEX].headers[1].measureGroupHeader;
            expect(returnValue).toBe(expectedValue);
        });
        it('should throw an error if measureGroup is not the last header on it\'s dimension', () => {
            const sampleDimensions = fixtures.barChartWithStackByAndViewByAttributes.executionResponse.dimensions;
            const invalidDimensions = [
                {
                    ...sampleDimensions[VIEW_BY_DIMENSION_INDEX],
                    headers: [
                        ...sampleDimensions[VIEW_BY_DIMENSION_INDEX].headers,
                        ...sampleDimensions[STACK_BY_DIMENSION_INDEX].headers
                    ]
                }
            ];
            expect(findMeasureGroupInDimensions.bind(this, invalidDimensions)).toThrow();
        });
    });

    describe('findAttributeInDimension', () => {
        const { dimensions } = fixtures.barChartWithStackByAndViewByAttributes.executionResponse;
        const { headerItems } = fixtures
            .barChartWithStackByAndViewByAttributes
            .executionResult;
        it('should return the view by attribute header with header items', () => {
            const returnValue = findAttributeInDimension(
                dimensions[VIEW_BY_DIMENSION_INDEX],
                headerItems[VIEW_BY_DIMENSION_INDEX]
            );
            const expectedValue = {
                ...dimensions[VIEW_BY_DIMENSION_INDEX].headers[0].attributeHeader,
                items: headerItems[VIEW_BY_DIMENSION_INDEX][0]
            };
            expect(returnValue).toEqual(expectedValue);
        });
        it('should return the stack by attribute header with header items', () => {
            const returnValue = findAttributeInDimension(
                dimensions[STACK_BY_DIMENSION_INDEX],
                headerItems[STACK_BY_DIMENSION_INDEX]
            );
            const expectedValue = {
                ...dimensions[STACK_BY_DIMENSION_INDEX].headers[0].attributeHeader,
                items: headerItems[STACK_BY_DIMENSION_INDEX][0]
            };
            expect(returnValue).toEqual(expectedValue);
        });
    });

    describe('normalizeColorToRGB', () => {
        it('should just return the original color it is not in hex format', () => {
            const color = 'rgb(255, 255, 255)';
            expect(
                normalizeColorToRGB(color)
            ).toEqual(color);
        });
        it('should return color in rgb format if supplied color is in hex format', () => {
            const color = '#ffffff';
            const expectedColor = 'rgb(255, 255, 255)';
            expect(
                normalizeColorToRGB(color)
            ).toEqual(expectedColor);
        });
    });

    describe('getColorPalette', () => {
        it('should just return the original palette if there are no pop measures shorten to cover all legend items',
            () => {
            const [measureGroup, viewByAttribute, stackByAttribute] = getMVS(fixtures.barChartWithoutAttributes);
            const { afm } = fixtures.barChartWithoutAttributes.executionRequest;
            const type = 'column';
            expect(
                getColorPalette(
                    DEFAULT_COLOR_PALETTE,
                    measureGroup,
                    viewByAttribute,
                    stackByAttribute,
                    afm,
                    type
                )
            ).toEqual(DEFAULT_COLOR_PALETTE.slice(0, measureGroup.items.length));
        });

        it('should return a palette with a lighter color for each pop measure based on it`s source measure', () => {
            const [measureGroup, viewByAttribute, stackByAttribute] =
                getMVS(fixtures.barChartWithPopMeasureAndViewByAttribute);
            const { afm } = fixtures.barChartWithPopMeasureAndViewByAttribute.executionRequest;
            const type = 'column';

            const customPalette = ['rgb(50,50,50)', 'rgb(100,100,100)', 'rgb(150,150,150)', 'rgb(200,200,200)'];
            const updatedPalette =
                getColorPalette(customPalette, measureGroup, viewByAttribute, stackByAttribute, afm, type);

            expect(updatedPalette).toEqual(['rgb(173,173,173)', 'rgb(50,50,50)']);
        });

        it('should rotate colors from original palete and generate lighter PoP colors', () => {
            const [measureGroup, viewByAttribute, stackByAttribute] =
                getMVS(fixtures.barChartWith6PopMeasuresAndViewByAttribute);
            const { afm } = fixtures.barChartWith6PopMeasuresAndViewByAttribute.executionRequest;
            const type = 'column';

            const customPalette = ['rgb(50,50,50)', 'rgb(100,100,100)', 'rgb(150,150,150)', 'rgb(200,200,200)'];
            const updatedPalette =
                getColorPalette(customPalette, measureGroup, viewByAttribute, stackByAttribute, afm, type);

            expect(updatedPalette).toEqual(['rgb(173,173,173)', 'rgb(50,50,50)', 'rgb(193,193,193)',
                'rgb(100,100,100)', 'rgb(213,213,213)', 'rgb(150,150,150)', 'rgb(233,233,233)', 'rgb(200,200,200)',
                'rgb(173,173,173)', 'rgb(50,50,50)', 'rgb(193,193,193)', 'rgb(100,100,100)' ]);
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

            const seriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                'column',
                DEFAULT_COLOR_PALETTE
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

        describe('in usecase of pie chart and treemap with metrics only', () => {
            const parameters = getSeriesItemDataParameters(fixtures.pieChartWithMetricsOnly, 0);
            const seriesItem = parameters[0];
            const seriesIndex = parameters[1];
            const measureGroup = parameters[2];
            const viewByAttribute = parameters[3];
            const stackByAttribute = parameters[4];

            const pieSeriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                'pie',
                DEFAULT_COLOR_PALETTE
            );

            const treemapSeriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                'treemap',
                DEFAULT_COLOR_PALETTE
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
                    DEFAULT_COLOR_PALETTE[0],
                    DEFAULT_COLOR_PALETTE[1],
                    DEFAULT_COLOR_PALETTE[2]
                ]);

                expect(
                    treemapSeriesItemData.map(pointData => pointData.color)
                ).toEqual([
                    DEFAULT_COLOR_PALETTE[0],
                    DEFAULT_COLOR_PALETTE[1],
                    DEFAULT_COLOR_PALETTE[2]
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

            const pieSeriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                'pie',
                DEFAULT_COLOR_PALETTE
            );

            const treemapSeriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                'treemap',
                DEFAULT_COLOR_PALETTE
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
                    DEFAULT_COLOR_PALETTE[0],
                    DEFAULT_COLOR_PALETTE[1]
                ]);

                expect(
                    treemapSeriesItemData.map(pointData => pointData.color)
                ).toEqual([
                    DEFAULT_COLOR_PALETTE[0],
                    DEFAULT_COLOR_PALETTE[1]
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
            const mVS = getMVS(dataSet);
            const type = 'column';
            const seriesData = getSeries(
                dataSet.executionResult.data,
                mVS[0],
                mVS[1],
                mVS[2],
                type,
                {} as any,
                DEFAULT_COLOR_PALETTE
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
                    DEFAULT_COLOR_PALETTE[0],
                    DEFAULT_COLOR_PALETTE[1],
                    DEFAULT_COLOR_PALETTE[2]
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
                        DEFAULT_COLOR_PALETTE
                    );
                }));
                expect(seriesData.map((seriesItem: any) => seriesItem.data)).toEqual(expectedData);
            });
        });

        describe('in usecase of bar chart with stack by and view by attributes', () => {
            const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
            const mVS = getMVS(dataSet);
            const type = 'column';
            const seriesData = getSeries(
                dataSet.executionResult.data,
                mVS[0],
                mVS[1],
                mVS[2],
                type,
                {} as any,
                DEFAULT_COLOR_PALETTE
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
                    DEFAULT_COLOR_PALETTE[0],
                    DEFAULT_COLOR_PALETTE[1]
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

                    return getSeriesItemData(
                        seriesItem,
                        si,
                        measureGroup,
                        viewByAttribute,
                        stackByAttribute,
                        type,
                        DEFAULT_COLOR_PALETTE
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

            it('should fill X, Y and Z with valid values when measure buckets are not empty', () => {
                const executionResultData = [
                    [ 1, 2, 3],
                    [ 4, 5, 6]
                ];
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
                const colorPallete = ['red', 'green'];

                const expectedSeries = [
                    {
                        name: 'abc',
                        color: 'red',
                        legendIndex: 0,
                        data: [{ x: 1, y: 2, z: 3 }]
                    }, {
                        name: 'def',
                        color: 'green',
                        legendIndex: 1,
                        data: [{ x: 4, y: 5, z: 6 }]
                    }
                ];
                const series = getBubbleChartSeries(
                    executionResultData, stackByAttribute, mdObject, colorPallete
                );

                expect(series).toEqual(expectedSeries);
            });

            it('should fill X and Y with zeroes when X and Y measure buckets are empty', () => {
                const executionResultData = [
                    [3],
                    [6]
                ];
                const stackByAttribute = false;
                const mdObject = {
                    visualizationClass: { uri: 'abc' },
                    buckets: [{
                        localIdentifier: 'tertiary_measures',
                        items: [dummyBucketItem]
                    }]
                };
                const colorPallete = ['red', 'green'];

                const expectedSeries = [
                    {
                        name: '',
                        color: 'red',
                        legendIndex: 0,
                        data: [{ x: 0, y: 0, z: 3 }]
                    }, {
                        name: '',
                        color: 'green',
                        legendIndex: 1,
                        data: [{ x: 0, y: 0, z: 6 }]
                    }
                ];
                const series = getBubbleChartSeries(
                    executionResultData, stackByAttribute, mdObject, colorPallete
                );

                expect(series).toEqual(expectedSeries);
            });

            it('should fill Y with x values when primary bucket is empty but secondary is not', () => {
                const executionResultData = [
                    [ 1, 3],
                    [ 4, 6]
                ];
                const stackByAttribute = false;
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
                const colorPallete = ['red', 'green'];

                const expectedSeries = [
                    {
                        name: '',
                        color: 'red',
                        legendIndex: 0,
                        data: [{ x: 0, y: 1, z: 3 }]
                    }, {
                        name: '',
                        color: 'green',
                        legendIndex: 1,
                        data: [{ x: 0, y: 4, z: 6 }]
                    }
                ];
                const series = getBubbleChartSeries(
                    executionResultData, stackByAttribute, mdObject, colorPallete
                );

                expect(series).toEqual(expectedSeries);
            });

            it('should fill X with x and Z with z values when secondary bucket is empty', () => {
                const executionResultData = [
                    [1, 3],
                    [4, 6]
                ];
                const stackByAttribute = false;
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
                const colorPallete = ['red', 'green'];

                const expectedSeries = [
                    {
                        name: '',
                        color: 'red',
                        legendIndex: 0,
                        data: [{ x: 1, y: 0, z: 3 }]
                    }, {
                        name: '',
                        color: 'green',
                        legendIndex: 1,
                        data: [{ x: 4, y: 0, z: 6 }]
                    }
                ];
                const series = getBubbleChartSeries(
                    executionResultData, stackByAttribute, mdObject, colorPallete
                );

                expect(series).toEqual(expectedSeries);
            });

            it('should fill Z with NaNs when tertiary bucket is empty', () => {
                const executionResultData = [
                    [1, 3],
                    [4, 6]
                ];
                const stackByAttribute = false;
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
                const colorPallete = ['red', 'green'];

                const expectedSeries = [
                    {
                        name: '',
                        color: 'red',
                        legendIndex: 0,
                        data: [{ x: 1, y: 3, z: NaN }]
                    }, {
                        name: '',
                        color: 'green',
                        legendIndex: 1,
                        data: [{ x: 4, y: 6, z: NaN }]
                    }
                ];
                const series = getBubbleChartSeries(
                    executionResultData, stackByAttribute, mdObject, colorPallete
                );

                expect(series).toEqual(expectedSeries);
            });

            it('should handle null in result', () => {
                const executionResultData = [
                    [null, 2, 3],
                    [4, null, 6],
                    [7, 8, null]
                ];
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
                const colorPallete = ['red', 'green', 'blue'];

                const expectedSeries = [
                    {
                        name: 'abc',
                        color: 'red',
                        legendIndex: 0,
                        data: [] as any
                    }, {
                        name: 'def',
                        color: 'green',
                        legendIndex: 1,
                        data: []
                    }, {
                        name: 'ghi',
                        color: 'blue',
                        legendIndex: 2,
                        data: []
                    }
                ];
                const series = getBubbleChartSeries(
                    executionResultData, stackByAttribute, mdObject, colorPallete
                );

                expect(series).toEqual(expectedSeries);
            });
        });

        describe('in use case of treemap', () => {
            describe('with only one measure', () => {
                const dataSet = fixtures.barChartWithSingleMeasureAndNoAttributes;
                const mVS = getMVSTreemap(dataSet);
                const type = 'treemap';
                const seriesData = getSeries(
                    dataSet.executionResult.data,
                    mVS[0],
                    mVS[1],
                    mVS[2],
                    type,
                    {} as any,
                    DEFAULT_COLOR_PALETTE
                );

                it('should return only one serie', () => {
                    expect(seriesData.length).toBe(1);
                });

                it('should fill correct series name equal to measure name', () => {
                    expect(seriesData[0].name).toEqual('Amount');
                });

                it('should fill correct series color', () => {
                    expect(seriesData[0].color).toEqual(DEFAULT_COLOR_PALETTE[0]);
                });

                it('should fill correct series legendIndex', () => {
                    expect(seriesData[0].legendIndex).toEqual(0);
                });

                it('should fill correct series data', () => {
                    expect(seriesData[0].data.length).toBe(1);
                    expect(seriesData[0].data[0]).toMatchObject({
                        y: 116625456.54,
                        value: 116625456.54,
                        color: DEFAULT_COLOR_PALETTE[0],
                        format: '#,##0.00',
                        legendIndex: 0,
                        name: 'Amount',
                        marker: expect.any(Object)
                    });
                });
            });

            describe('with one measure and view by attribute', () => {
                const dataSet = fixtures.treemapWithMetricAndViewByAttribute;
                const mVS = getMVSTreemap(dataSet);
                const type = 'treemap';
                const seriesData = getSeries(
                    dataSet.executionResult.data,
                    mVS[0],
                    mVS[1],
                    mVS[2],
                    type,
                    dataSet.mdObject,
                    DEFAULT_COLOR_PALETTE
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
                        y: 80406324.96,
                        value: 80406324.96,
                        color: DEFAULT_COLOR_PALETTE[0],
                        format: '#,##0.00',
                        legendIndex: 0,
                        name: 'Direct Sales',
                        marker: expect.any(Object)
                    });

                    expect(seriesData[0].data[1]).toMatchObject({
                        y: 36219131.58,
                        value: 36219131.58,
                        color: DEFAULT_COLOR_PALETTE[1],
                        format: '#,##0.00',
                        legendIndex: 1,
                        name: 'Inside Sales',
                        marker: expect.any(Object)
                    });
                });
            });

            describe('with one measure and stack by attribute', () => {
                const dataSet = fixtures.treemapWithMetricAndStackByAttribute;
                const mVS = getMVSTreemap(dataSet);
                const type = 'treemap';
                const seriesData = getSeries(
                    dataSet.executionResult.data,
                    mVS[0],
                    mVS[1],
                    mVS[2],
                    type,
                    dataSet.mdObject,
                    DEFAULT_COLOR_PALETTE
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
                        color: DEFAULT_COLOR_PALETTE[0],
                        showInLegend: true,
                        legendIndex: 0,
                        format: '#,##0.00'
                    });

                    expect(seriesData[0].data[1]).toMatchObject({
                        parent: '0',
                        x: 0,
                        y: 0,
                        value: 80406324.96,
                        color: DEFAULT_COLOR_PALETTE[0],
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'Direct Sales'
                    });

                    expect(seriesData[0].data[2]).toMatchObject({
                        parent: '0',
                        x: 0,
                        y: 1,
                        value: 36219131.58,
                        color: getLighterColor(DEFAULT_COLOR_PALETTE[0], 0.4),
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'Inside Sales'
                    });
                });
            });

            describe('with one measure, view by and stack by attribute', () => {
                const dataSet = fixtures.treemapWithMetricViewByAndStackByAttribute;
                const mVS = getMVSTreemap(dataSet);
                const type = 'treemap';
                const seriesData = getSeries(
                    dataSet.executionResult.data,
                    mVS[0],
                    mVS[1],
                    mVS[2],
                    type,
                    dataSet.mdObject,
                    DEFAULT_COLOR_PALETTE
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
                        color: DEFAULT_COLOR_PALETTE[0],
                        showInLegend: true,
                        legendIndex: 0,
                        format: '#,##0.00'
                    });
                    expect(seriesData[0].data[1]).toMatchObject({
                        id: '1',
                        name: 'Inside Sales',
                        color: DEFAULT_COLOR_PALETTE[1],
                        showInLegend: true,
                        legendIndex: 1,
                        format: '#,##0.00'
                    });

                    expect(seriesData[0].data[2]).toMatchObject({
                        parent: '0',
                        x: 0,
                        y: 0,
                        value: 58427629.5,
                        color: DEFAULT_COLOR_PALETTE[0],
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'West Coast'
                    });

                    expect(seriesData[0].data[3]).toMatchObject({
                        parent: '0',
                        x: 1,
                        y: 1,
                        value: 21978695.46,
                        color: getLighterColor(DEFAULT_COLOR_PALETTE[0], 0.4),
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'East Coast'
                    });

                    expect(seriesData[0].data[4]).toMatchObject({
                        parent: '1',
                        x: 2,
                        y: 2,
                        value: 30180730.62,
                        color: DEFAULT_COLOR_PALETTE[1],
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'West Coast'
                    });

                    expect(seriesData[0].data[5]).toMatchObject({
                        parent: '1',
                        x: 3,
                        y: 3,
                        value: 6038400.96,
                        color: getLighterColor(DEFAULT_COLOR_PALETTE[1], 0.4),
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'East Coast'
                    });
                });
            });

            describe('with two measures and stack by attribute including client sorting', () => {
                const dataSet = fixtures.treemapWithTwoMetricsAndStackByAttribute;
                const mVS = getMVSTreemap(dataSet);
                const type = 'treemap';
                const seriesData = getSeries(
                    dataSet.executionResult.data,
                    mVS[0],
                    mVS[1],
                    mVS[2],
                    type,
                    dataSet.mdObject,
                    DEFAULT_COLOR_PALETTE
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
                        color: DEFAULT_COLOR_PALETTE[0],
                        showInLegend: true,
                        legendIndex: 0,
                        format: '#,##0.00'
                    });
                    expect(seriesData[0].data[1]).toMatchObject({
                        id: '1',
                        name: '# of Open Opps.',
                        color: DEFAULT_COLOR_PALETTE[1],
                        showInLegend: true,
                        legendIndex: 1,
                        format: '#,##0.00'
                    });

                    expect(seriesData[0].data[2]).toMatchObject({
                        parent: '0',
                        x: 0,
                        y: 0,
                        value: 58427629.5,
                        color: DEFAULT_COLOR_PALETTE[0],
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'Direct Sales'
                    });

                    expect(seriesData[0].data[3]).toMatchObject({
                        parent: '0',
                        x: 0,
                        y: 1,
                        value: 21978695.46,
                        color: getLighterColor(DEFAULT_COLOR_PALETTE[0], 0.4),
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'Inside Sales'
                    });

                    expect(seriesData[0].data[4]).toMatchObject({
                        parent: '1',
                        x: 1,
                        y: 1,
                        value: 30180730.62,
                        color: DEFAULT_COLOR_PALETTE[1],
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'Inside Sales'
                    });

                    expect(seriesData[0].data[5]).toMatchObject({
                        parent: '1',
                        x: 1,
                        y: 0,
                        value: 6038400.96,
                        color: getLighterColor(DEFAULT_COLOR_PALETTE[1], 0.4),
                        format: '#,##0.00',
                        showInLegend: false,
                        name: 'Direct Sales'
                    });
                });
            });
        });
    });

    describe('getDrillContext', () => {
        it('should return correct drillContex for bar chart with stack by and view by attributes', () => {
            const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
            const [measureGroup, viewByAttribute, stackByAttribute] = getMVS(dataSet);
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
            const drillContext = getDrillContext(stackByItem, viewByItem, measures, afm);
            expect(drillContext).toEqual([
                {
                    format: '#,##0.00',
                    id: 'amountMetric',
                    identifier: 'ah1EuQxwaCqs',
                    uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1279',
                    value: 'Amount'
                },
                {
                    id: '1226',
                    identifier: 'label.owner.department',
                    uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1027',
                    value: 'Direct Sales'
                },
                {
                    id: '1225',
                    identifier: 'label.owner.region',
                    uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1024',
                    value: 'East Coast'
                }
            ]);
        });

        it('should return correct drillContex for pie chart measures only', () => {
            const dataSet = fixtures.pieChartWithMetricsOnly;
            const [measureGroup] = getMVS(dataSet);
            const measures = [measureGroup.items[0].measureHeaderItem];

            const viewByItem: any = null;
            const stackByItem: any = null;

            const { afm } = dataSet.executionRequest;
            const drillContext = getDrillContext(stackByItem, viewByItem, measures, afm);
            expect(drillContext).toEqual([
                {
                    format: '#,##0.00',
                    id: 'lostMetric',
                    identifier: 'af2Ewj9Re2vK',
                    uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283',
                    value: 'Lost'
                }
            ]);
        });
    });

    describe('getDrillableSeries', () => {
        describe('in usecase of scatter plot with 2 measures and attribute', () => {
            const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;
            const { afm } = dataSet.executionRequest;
            const mVS = getMVS(dataSet);
            const type = 'scatter';
            const seriesWithoutDrillability = getSeries(
                dataSet.executionResult.data,
                mVS[0],
                mVS[1],
                mVS[2],
                type,
                {} as any,
                DEFAULT_COLOR_PALETTE
            );

            const drillableMeasures = [{
                uri: dataSet.executionResponse.dimensions[0]
                    .headers[0].measureGroupHeader.items[0].measureHeaderItem.uri
            }];
            const drillableMeasuresSeriesData = getDrillableSeries(
                seriesWithoutDrillability,
                drillableMeasures,
                mVS[0],
                mVS[1],
                mVS[2],
                type,
                afm
            );

            it('should assign correct drillContext to pointData with drilldown true', () => {
                expect(drillableMeasuresSeriesData
                    .map((seriesItem: any) => seriesItem.data[0].drillContext)
                ).toEqual([
                    [
                        {
                            format: '#,##0.00',
                            id: 'lostMetric',
                            identifier: 'af2Ewj9Re2vK',
                            uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283',
                            value: '<button>Lost</button> ...'
                        }, {
                            format: '#,##0.00',
                            id: 'wonMetric',
                            identifier: 'afSEwRwdbMeQ',
                            uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1284',
                            value: 'Won'
                        }, {
                            id: '2008',
                            identifier: 'created.aag81lMifn6q',
                            uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/158',
                            value: '<button>2008</button>'
                        }
                    ]
                ]);
            });

            it('should fillter out points with one or both coordinates null', () => {
                const dataSetWithNulls = fixtures.scatterWithNulls;
                const { afm } = dataSetWithNulls.executionRequest;
                const mVS = getMVS(dataSetWithNulls);
                const type = 'scatter';

                const seriesWithoutDrillability = getSeries(
                    dataSetWithNulls.executionResult.data,
                    mVS[0],
                    mVS[1],
                    mVS[2],
                    type,
                    dataSetWithNulls.mdObject,
                    DEFAULT_COLOR_PALETTE
                );

                const drillableMeasures = [{
                    uri: dataSetWithNulls.executionResponse.dimensions[1]
                        .headers[0].measureGroupHeader.items[1].measureHeaderItem.uri
                }];
                const drillableMeasuresSeriesData = getDrillableSeries(
                    seriesWithoutDrillability,
                    drillableMeasures,
                    mVS[0],
                    mVS[1],
                    mVS[2],
                    type,
                    afm
                );
                expect(seriesWithoutDrillability[0].data.length).toEqual(6);
                expect(drillableMeasuresSeriesData[0].data.length).toEqual(3);
            });
        });

        describe('in usecase of bubble chart with 3 measures and attribute', () => {
            const dataSet = fixtures.bubbleChartWith3MetricsAndAttribute;
            const { afm } = dataSet.executionRequest;
            const mVS = getMVS(dataSet);
            const type = 'bubble';
            const seriesWithoutDrillability = getSeries(
                dataSet.executionResult.data,
                mVS[0],
                mVS[1],
                mVS[2],
                type,
                dataSet.mdObject,
                DEFAULT_COLOR_PALETTE
            );
            const drillableMeasures = [{
                uri: dataSet.executionResponse.dimensions[1]
                    .headers[0].measureGroupHeader.items[0].measureHeaderItem.uri
            }];
            const drillableMeasuresSeriesData = getDrillableSeries(
                seriesWithoutDrillability,
                drillableMeasures,
                mVS[0],
                mVS[1],
                mVS[2],
                type,
                afm
            );

            it('should assign correct drillContext to pointData with drilldown true', () => {
                expect(drillableMeasuresSeriesData.length).toBe(20);
                expect(drillableMeasuresSeriesData[8].data[0]).toEqual({
                    x: 245,
                    y: 32,
                    z: 2280481.04,
                    drilldown: true,
                    drillContext: [
                        {
                            id: '784a5018a51049078e8f7e86247e08a3',
                            format: '#,##0.00',
                            value: '_Snapshot [EOP-2]',
                            identifier: 'ab0bydLaaisS',
                            uri: '/gdc/md/hzyl5wlh8rnu0ixmbzlaqpzf09ttb7c8/obj/67097'
                        },
                        {
                            id: '9e5c3cd9a93f4476a93d3494cedc6010',
                            format: '#,##0',
                            value: '# of Open Opps.',
                            identifier: 'aaYh6Voua2yj',
                            uri: '/gdc/md/hzyl5wlh8rnu0ixmbzlaqpzf09ttb7c8/obj/13465'
                        },
                        {
                            id: '71d50cf1d13746099b7f506576d78e4a',
                            format: '$#,#00.00',
                            value: 'Remaining Quota',
                            identifier: 'ab4EFOAmhjOx',
                            uri: '/gdc/md/hzyl5wlh8rnu0ixmbzlaqpzf09ttb7c8/obj/1543'
                        },
                        {
                            id: '1235',
                            value: 'Jessica Traven',
                            identifier: 'label.owner.id.name',
                            uri: '/gdc/md/hzyl5wlh8rnu0ixmbzlaqpzf09ttb7c8/obj/1028'
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
                const mVS = getMVS(dataSetWithNulls);
                const type = 'bubble';

                const seriesWithoutDrillability = getSeries(
                    dataSetWithNulls.executionResult.data,
                    mVS[0],
                    mVS[1],
                    mVS[2],
                    type,
                    dataSetWithNulls.mdObject,
                    DEFAULT_COLOR_PALETTE
                );

                const drillableMeasures = [{
                    uri: dataSetWithNulls.executionResponse.dimensions[1]
                        .headers[0].measureGroupHeader.items[1].measureHeaderItem.uri
                }];
                const drillableMeasuresSeriesData = getDrillableSeries(
                    seriesWithoutDrillability,
                    drillableMeasures,
                    mVS[0],
                    mVS[1],
                    mVS[2],
                    type,
                    afm
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
            const mVS = getMVS(dataSet);
            const type = 'bar';
            const seriesWithoutDrillability = getSeries(
                dataSet.executionResult.data,
                mVS[0],
                mVS[1],
                mVS[2],
                type,
                {} as any,
                DEFAULT_COLOR_PALETTE
            );

            describe('with all drillable measures', () => {
                const drillableMeasures = [{
                    uri: dataSet.executionRequest.afm.attributes[0].displayForm.uri
                }];
                const drillableMeasuresSeriesData = getDrillableSeries(
                    seriesWithoutDrillability,
                    drillableMeasures,
                    mVS[0],
                    mVS[1],
                    mVS[2],
                    type,
                    afm
                );

                it('should assign correct drillContext to pointData with drilldown true', () => {
                    const startYear = parseInt(// should be 2008
                        drillableMeasuresSeriesData[0].data[0].drillContext[1].value, 10
                    );
                    drillableMeasuresSeriesData.forEach((seriesItem: any) => {
                        seriesItem.data.forEach((point: any, index: number) => {
                            expect(point.drillContext[1].value - index).toEqual(startYear);
                        });
                    });
                });
            });
        });

        describe('in usecase of bar chart with 3 measures and view by attribute', () => {
            const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;
            const { afm } = dataSet.executionRequest;
            const mVS = getMVS(dataSet);
            const type = 'column';
            const seriesWithoutDrillability = getSeries(
                dataSet.executionResult.data,
                mVS[0],
                mVS[1],
                mVS[2],
                type,
                {} as any,
                DEFAULT_COLOR_PALETTE
            );

            describe('with no drillable items', () => {
                const noDrillableItems: any = [];
                const noDrillableSeriesData = getDrillableSeries(
                    seriesWithoutDrillability,
                    noDrillableItems,
                    mVS[0],
                    mVS[1],
                    mVS[2],
                    type,
                    afm
                );
                it('should return the same number of items as seriesWithoutDrillability', () => {
                    expect(noDrillableSeriesData.length).toBe(seriesWithoutDrillability.length);
                });

                it('should return new series array with isDrillable false', () => {
                    expect(noDrillableSeriesData).not.toBe(seriesWithoutDrillability);
                    expect(noDrillableSeriesData
                        .map((seriesItem: any) => seriesItem.isDrillable)).toEqual([false, false, false]);
                });

                it('should return new pointData items drilldown false and no drillContext', () => {
                    expect(noDrillableSeriesData
                        .map((seriesItem: any) => seriesItem.data.map(({ drilldown, drillContext }: any) => {
                            return { drilldown, drillContext };
                        }))
                    ).toEqual([
                        [
                            { drillContext: undefined, drilldown: false },
                            { drillContext: undefined, drilldown: false },
                            { drillContext: undefined, drilldown: false },
                            { drillContext: undefined, drilldown: false },
                            { drillContext: undefined, drilldown: false }
                        ],
                        [
                            { drillContext: undefined, drilldown: false },
                            { drillContext: undefined, drilldown: false },
                            { drillContext: undefined, drilldown: false },
                            { drillContext: undefined, drilldown: false },
                            { drillContext: undefined, drilldown: false }
                        ],
                        [
                            { drillContext: undefined, drilldown: false },
                            { drillContext: undefined, drilldown: false },
                            { drillContext: undefined, drilldown: false },
                            { drillContext: undefined, drilldown: false },
                            { drillContext: undefined, drilldown: false }
                        ]
                    ]);
                });
            });

            describe('with first and last drillable measures', () => {
                const twoDrillableMeasuresItems = [
                    { uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283' },
                    { uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1285' }
                ];
                const twoDrillableMeasuresSeriesData = getDrillableSeries(
                    seriesWithoutDrillability,
                    twoDrillableMeasuresItems,
                    mVS[0],
                    mVS[1],
                    mVS[2],
                    type,
                    afm
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

                it('should assign correct drillContext to pointData with drilldown true', () => {
                    expect(twoDrillableMeasuresSeriesData
                        .map((seriesItem: any) => seriesItem.data[0].drillContext)
                    ).toEqual([
                        [
                            {
                                format: '#,##0.00',
                                id: 'lostMetric',
                                identifier: 'af2Ewj9Re2vK',
                                uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283',
                                value: '<button>Lost</button> ...'
                            }, {
                                id: '2008',
                                identifier: 'created.aag81lMifn6q',
                                uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/158',
                                value: '<button>2008</button>'
                            }
                        ],
                        undefined,
                        [
                            {
                                format: '#,##0.00',
                                id: 'expectedMetric',
                                identifier: 'alUEwmBtbwSh',
                                uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1285',
                                value: 'Expected'
                            }, {
                                id: '2008',
                                identifier: 'created.aag81lMifn6q',
                                uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/158',
                                value: '<button>2008</button>'
                            }
                        ]
                    ]);
                });
            });
        });

        describe('in usecase of bar chart with stack by and view by attributes', () => {
            const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
            const mVS = getMVS(dataSet);
            const type = 'column';
            const seriesData = getSeries(
                dataSet.executionResult.data,
                mVS[0],
                mVS[1],
                mVS[2],
                type,
                {} as any,
                DEFAULT_COLOR_PALETTE
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
                    DEFAULT_COLOR_PALETTE[0],
                    DEFAULT_COLOR_PALETTE[1]
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
                        DEFAULT_COLOR_PALETTE
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
        const mVS = getMVS(dataSet);
        const viewByAttribute = mVS[1];
        const pointData = {
            y: 1,
            format: '# ###',
            name: 'point',
            category: 'category',
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
                    category: '&gt;"&\'&lt;'
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
        const [measureGroup, , stackByAttribute] = getMVS(dataSet);

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
            `<table class=\"tt-values\"><tr>
                <td class=\"title\">Sales Rep</td>
                <td class=\"value\">point name</td>
            </tr></table>`;

            const tooltipFn = generateTooltipXYFn(measures, stackByAttribute);
            expect(tooltipFn(point)).toEqual(expectedResult);
        });

        it('should generate valid tooltip for 1 measure', () => {
            const measures = [measureGroup.items[0]];
            const expectedResult =
            `<table class=\"tt-values\"><tr>
                <td class=\"title\">Sales Rep</td>
                <td class=\"value\">point name</td>
            </tr>\n<tr>
                <td class=\"title\">_Snapshot [EOP-2]</td>
                <td class=\"value\">10.00</td>
            </tr></table>`;

            const tooltipFn = generateTooltipXYFn(measures, stackByAttribute);
            expect(tooltipFn(point)).toEqual(expectedResult);
        });

        it('should generate valid tooltip for 2 measures', () => {
            const measures = [measureGroup.items[0], measureGroup.items[1]];
            const expectedResult =
            `<table class=\"tt-values\"><tr>
                <td class=\"title\">Sales Rep</td>
                <td class=\"value\">point name</td>
            </tr>\n<tr>
                <td class=\"title\">_Snapshot [EOP-2]</td>
                <td class=\"value\">10.00</td>
            </tr>\n<tr>
                <td class=\"title\"># of Open Opps.</td>
                <td class=\"value\">20</td>
            </tr></table>`;

            const tooltipFn = generateTooltipXYFn(measures, stackByAttribute);
            expect(tooltipFn(point)).toEqual(expectedResult);
        });

        it('should generate valid tooltip for 3 measures', () => {
            const measures = [measureGroup.items[0], measureGroup.items[1], measureGroup.items[2]];
            const expectedResult =
            `<table class=\"tt-values\"><tr>
                <td class=\"title\">Sales Rep</td>
                <td class=\"value\">point name</td>
            </tr>\n<tr>
                <td class=\"title\">_Snapshot [EOP-2]</td>
                <td class=\"value\">10.00</td>
            </tr>\n<tr>
                <td class=\"title\"># of Open Opps.</td>
                <td class=\"value\">20</td>
            </tr>\n<tr>
                <td class=\"title\">Remaining Quota</td>
                <td class=\"value\">$30.00</td>
            </tr></table>`;

            const tooltipFn = generateTooltipXYFn(measures, stackByAttribute);
            expect(tooltipFn(point)).toEqual(expectedResult);
        });

        it('should generate valid tooltip for point without name using name of serie', () => {
            const measures = [measureGroup.items[0], measureGroup.items[1], measureGroup.items[2]];
            const pointWithoutName = cloneDeep(point);
            pointWithoutName.name = undefined;

            const expectedResult =
            `<table class=\"tt-values\"><tr>
                <td class=\"title\">Sales Rep</td>
                <td class=\"value\">serie name</td>
            </tr>\n<tr>
                <td class=\"title\">_Snapshot [EOP-2]</td>
                <td class=\"value\">10.00</td>
            </tr>\n<tr>
                <td class=\"title\"># of Open Opps.</td>
                <td class=\"value\">20</td>
            </tr>\n<tr>
                <td class=\"title\">Remaining Quota</td>
                <td class=\"value\">$30.00</td>
            </tr></table>`;

            const tooltipFn = generateTooltipXYFn(measures, stackByAttribute);
            expect(tooltipFn(pointWithoutName)).toEqual(expectedResult);
        });
    });

    describe('generateTooltipTreemapFn', () => {
        const point: IPoint = {
            category: 'category',
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
            `<table class=\"tt-values\"><tr>
                <td class=\"title\">category</td>
                <td class=\"value\">300</td>
            </tr></table>`;

            const tooltipFn = generateTooltipTreemapFn(null, null);
            expect(tooltipFn(point)).toEqual(expectedResult);
        });

        it('should respect measure format', () => {
            const pointWithFormat = cloneDeep(point);
            pointWithFormat.format = 'abcd';
            const expectedResult =
            `<table class=\"tt-values\"><tr>
                <td class=\"title\">category</td>
                <td class=\"value\">abcd</td>
            </tr></table>`;

            const tooltipFn = generateTooltipTreemapFn(null, null);
            expect(tooltipFn(pointWithFormat)).toEqual(expectedResult);
        });

        it('should generate valid tooltip for 1 measure and view by', () => {
            const dataSet = fixtures.treemapWithMetricAndViewByAttribute;
            const [, viewByAttribute , stackByAttribute] = getMVSTreemap(dataSet);
            const expectedResult =
            `<table class=\"tt-values\"><tr>
                <td class=\"title\">Department</td>
                <td class=\"value\">Direct Sales</td>
            </tr>\n<tr>
                <td class=\"title\">serie name</td>
                <td class=\"value\">300</td>
            </tr></table>`;

            const tooltipFn = generateTooltipTreemapFn(viewByAttribute, stackByAttribute);
            expect(tooltipFn(point)).toEqual(expectedResult);
        });

        it('should generate valid tooltip for 1 measure and stack by', () => {
            const dataSet = fixtures.treemapWithMetricAndStackByAttribute;
            const [, viewByAttribute, stackByAttribute] = getMVSTreemap(dataSet);
            const expectedResult =
            `<table class=\"tt-values\"><tr>
                <td class=\"title\">Department</td>
                <td class=\"value\">Direct Sales</td>
            </tr>\n<tr>
                <td class=\"title\">category</td>
                <td class=\"value\">300</td>
            </tr></table>`;

            const tooltipFn = generateTooltipTreemapFn(viewByAttribute, stackByAttribute);
            expect(tooltipFn(point)).toEqual(expectedResult);
        });

        it('should generate valid tooltip for 1 measure, view by and stack by', () => {
            const dataSet = fixtures.treemapWithMetricViewByAndStackByAttribute;
            const [, viewByAttribute, stackByAttribute] = getMVSTreemap(dataSet);
            const expectedResult =
            `<table class=\"tt-values\"><tr>
                <td class=\"title\">Department</td>
                <td class=\"value\">Direct Sales</td>
            </tr>\n<tr>
                <td class=\"title\">Region</td>
                <td class=\"value\">West Coast</td>
            </tr>\n<tr>
                <td class=\"title\">serie name</td>
                <td class=\"value\">300</td>
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
                expect(chartOptions.colorPalette).toEqual(DEFAULT_COLOR_PALETTE.slice(0, 3));
            });

            it('should assign correct tooltip function', () => {
                const mVS = getMVS(dataSet);
                const viewByAttribute = mVS[1];
                const pointData = {
                    y: 1,
                    format: '# ###',
                    name: 'point',
                    category: 'category',
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
                const mVS = getMVS(fixtures.barChartWithStackByAndViewByAttributes);
                const viewByAttribute = mVS[1];
                const pointData = {
                    y: 1,
                    format: '# ###',
                    name: 'point',
                    category: 'category',
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
                const mVS = getMVS(fixtures.barChartWithStackByAndViewByAttributes);
                const viewByAttribute = mVS[1];
                const pointData = {
                    x: 0,
                    y: 1,
                    format: '# ###',
                    name: 'point',
                    category: 'category',
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
                    category: 'category',
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
                expect(chartOptions.colorPalette).toEqual(['rgb(161,224,243)', 'rgb(20,178,226)']);
            });

            it('should assign correct tooltip function', () => {
                const mVS = getMVS(fixtures.barChartWithPopMeasureAndViewByAttribute);
                const viewByAttribute = mVS[1];
                const pointData = {
                    y: 1,
                    format: '# ###',
                    name: 'point',
                    category: 'category',
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

            it('should generate two axes for dual axis chart', () => {
                const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute, {
                    type: 'dual',
                    mdObject: {
                        buckets: [
                            { localIdentifier: 'measures', items: [ {} ] },
                            { localIdentifier: 'secondary', items: [ {} ] }
                        ]
                    }
                });
                const expectedAxes = [{
                    label: '<button>Lost</button> ...',
                    format: '#,##0.00',
                    seriesIndices: [0]
                }, {
                    format: '#,##0.00',
                    label: 'Won',
                    opposite: true,
                    seriesIndices: [1, 2]
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

        describe('HeatMap configuration', () => {
            describe('generateTooltipHeatMapFn', () => {
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
                    const tooltipFn = generateTooltipHeatMapFn(viewBy, stackBy);
                    const expectedResult =
            `<table class=\"tt-values\"><tr>
                <td class=\"title\">stackAttr</td>
                <td class=\"value\">stackHeader</td>
            </tr>\n<tr>
                <td class=\"title\">viewAttr</td>
                <td class=\"value\">viewHeader</td>
            </tr>\n<tr>
                <td class=\"title\">name</td>
                <td class=\"value\">abcd</td>
            </tr></table>`;

                    expect(tooltipFn(point)).toEqual(expectedResult);
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
                        borderWidth: 1,
                        data: [
                            { x: 0, y: 0, value: 21978695.46, drilldown: false },
                            { x: 1, y: 0, value: 6038400.96, drilldown: false },
                            { x: 0, y: 1, value: 58427629.5, drilldown: false },
                            { x: 1, y: 1, value: 30180730.62, drilldown: false }
                        ],
                        dataLabels: {
                            enabled: true,
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

                describe('getHeatMapDataClasses', () => {
                    it('should return single dataClass when series have only one value', () => {
                        const series = [{
                            data: [{
                                value: 10
                            }]
                        }];
                        const colorPalette = ['r', 'g', 'b'];
                        const expectedDataClasses = [
                            {
                                from: 10,
                                to: 10,
                                color: 'g'
                            }
                        ];
                        const dataClasses = getHeatMapDataClasses(series, colorPalette);

                        expect(dataClasses).toEqual(expectedDataClasses);
                    });

                    it('should return 7 data classes with valid color', () => {
                        const series = [{
                            data: [{
                                    value: 10
                                }, {
                                    value: 20
                                }, {
                                    value: 30
                            }]
                        }];
                        const colorPalette = ['r', 'g', 'b'];
                        const approximatelyExpectedDataClasses = [
                            {
                                from: 10,
                                color: 'r'
                            }, {
                                color: 'g'
                            }, {
                                color: 'b'
                            }, {
                                color: 'r'
                            }, {
                                color: 'g'
                            }, {
                                color: 'b'
                            }, {
                                to: 30,
                                color: 'r'
                            }
                        ];
                        const dataClasses = getHeatMapDataClasses(series, colorPalette);

                        expect(dataClasses).toMatchObject(approximatelyExpectedDataClasses);
                    });
                });
            });
        });
    });
});
