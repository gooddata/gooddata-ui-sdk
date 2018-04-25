// (C) 2007-2018 GoodData Corporation
import range = require('lodash/range');
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
    getChartOptions,
    generateTooltipHeatMapFn
} from '../chartOptionsBuilder';
import { DEFAULT_CATEGORIES_LIMIT } from '../highcharts/commonConfiguration';

import * as fixtures from '../../../../../stories/test_data/fixtures';

import {
    PIE_CHART_LIMIT,
    VIEW_BY_DIMENSION_INDEX,
    STACK_BY_DIMENSION_INDEX
} from '../constants';

import {
    DEFAULT_COLOR_PALETTE
} from '../../utils/color';
import { IDrillableItem } from '../../../..';

export function generateChartOptions(
    dataSet: any = fixtures.barChartWithStackByAndViewByAttributes,
    config: any = {
        type: 'column',
        stacking: false
    },
    drillableItems: IDrillableItem[] = []
) {
    const {
        executionRequest: { afm, resultSpec },
        executionResponse: { dimensions },
        executionResult: { data, headerItems }
    } = dataSet;
    return getChartOptions(
        afm,
        resultSpec,
        dimensions,
        data,
        headerItems,
        config,
        drillableItems
    );
}

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
        it('should be able to validate successfuly', () => {
            const chartOptions = barChartWithStackByAndViewByAttributesOptions;
            const validationResult = validateData({}, chartOptions);

            expect(
                validationResult
            ).toEqual({
                dataTooLarge: false,
                hasNegativeValue: false
            });
        });
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

        it('should validate with "dataTooLarge: true" against default chart categories limit ' +
            `of ${DEFAULT_CATEGORIES_LIMIT}`, () => {
            const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute);
            chartOptions.data.categories = range(DEFAULT_CATEGORIES_LIMIT + 1);

            const validationResult = validateData({}, chartOptions);

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
            const validationResult = validateData({}, chartOptions);

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
            const validationResult = validateData({}, chartOptions);

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
            const validationResult = validateData({}, chartOptions);

            expect(
                validationResult
            ).toEqual({
                dataTooLarge: false,
                hasNegativeValue: true
            });
        });
        it('should validate with "hasNegativeValue: true" for treemap if its series contains a negative value',
            () => {
                const validationResult = validateData({}, treemapOptionsWithNegativeValue);
                expect(validationResult).toEqual({
                    dataTooLarge: false,
                    hasNegativeValue: true
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
                    ], [
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
                    ], [
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
            expect(getValues(tooltip)).toEqual(['series', ' 1']);
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

        it('should assign showInPercent true only if at least one measure`s format includes a "%" sign', () => {
            const dataSetWithPercentFormat = immutableSet(dataSet,
                `executionResponse.dimensions[${STACK_BY_DIMENSION_INDEX}]` +
                'headers[0].measureGroupHeader.items[0].measureHeaderItem.format',
                '0.00 %');
            const chartOptions = generateChartOptions(dataSetWithPercentFormat);
            expect(generateChartOptions(dataSet).showInPercent).toBe(false); // false by default
            expect(chartOptions.showInPercent).toBe(true); // true if format includes %
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
                fixtures.barChartWithViewByAttribute,
                { type: 'treemap' }
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
                    y: 1,
                    format: '# ###',
                    name: 'point',
                    category: 'category',
                    series: {
                        name: 'series'
                    }
                };

                const expectedTooltip = generateTooltipFn(viewByAttribute, 'column')(pointData);

                const pieChartTooltip = pieChartOptions.actions.tooltip(pointData);
                expect(pieChartTooltip).toBe(expectedTooltip);

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
                    }
                };

                const expectedPieChartTooltip = generateTooltipFn(null, 'pie')(pointData);
                const pieChartTooltip = pieChartOptions.actions.tooltip(pointData);
                expect(pieChartTooltip).toBe(expectedPieChartTooltip);

                const expectedTreemapTooltip = generateTooltipFn(null, 'treemap')(pointData);
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

            it('should assign showInPercent true only if at least one measure`s format includes a "%" sign', () => {
                const dataSet = fixtures.comboWithTwoMeasuresAndViewByAttribute;
                const dataSetWithPercentFormat = immutableSet(dataSet,
                    'executionResponse.dimensions[0]' +
                    'headers[0].measureGroupHeader.items[0].measureHeaderItem.format',
                    '0.00 %');
                const chartOptions = generateChartOptions(
                    dataSetWithPercentFormat,
                    {
                        type: 'combo'
                    });
                expect(generateChartOptions(dataSet).showInPercent).toBe(false); // false by default
                expect(chartOptions.showInPercent).toBe(true); // true if format includes %
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
            });
        });
    });
});
