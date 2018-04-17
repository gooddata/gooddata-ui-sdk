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
    getChartOptions
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

export function generateChartOptions(
    dataSet: any = fixtures.barChartWithStackByAndViewByAttributes,
    config: any = {
        type: 'column',
        stacking: false
    },
    drillableItems: any = []
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

    const pieChartOptionsWithNegativeValue = generateChartOptions({
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
    }, {
        type: 'pie'
    });

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

        describe('in usecase of pie chart with metrics only', () => {
            const parameters = getSeriesItemDataParameters(fixtures.pieChartWithMetricsOnly, 0);
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
                'pie',
                DEFAULT_COLOR_PALETTE
            );

            it('should fill correct pointData name', () => {
                expect(
                    seriesItemData.map(pointData => pointData.name)
                ).toEqual([
                    'Lost',
                    'Won',
                    'Expected'
                ]);
            });

            it('should fill correct pointData color', () => {
                expect(
                    seriesItemData.map(pointData => pointData.color)
                ).toEqual([
                    DEFAULT_COLOR_PALETTE[0],
                    DEFAULT_COLOR_PALETTE[1],
                    DEFAULT_COLOR_PALETTE[2]
                ]);
            });

            it('should fill correct pointData legendIndex', () => {
                expect(
                    seriesItemData.map(pointData => pointData.legendIndex)
                ).toEqual([0, 1, 2]);
            });

            it('should fill correct pointData format', () => {
                expect(
                    seriesItemData.map(pointData => pointData.format)
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

            const seriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                'pie',
                DEFAULT_COLOR_PALETTE
            );

            it('should fill correct pointData name', () => {
                expect(
                    seriesItemData.map(pointData => pointData.name)
                ).toEqual([
                    'Direct Sales',
                    'Inside Sales'
                ]);
            });

            it('should fill correct pointData color', () => {
                expect(
                    seriesItemData.map(pointData => pointData.color)
                ).toEqual([
                    DEFAULT_COLOR_PALETTE[0],
                    DEFAULT_COLOR_PALETTE[1]
                ]);
            });

            it('should fill correct pointData legendIndex', () => {
                expect(
                    seriesItemData.map(pointData => pointData.legendIndex)
                ).toEqual([0, 1]);
            });

            it('should fill correct pointData format', () => {
                expect(
                    seriesItemData.map(pointData => pointData.format)
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
            const measure = measureGroup.items[0].measureHeaderItem;

            const viewByItem = {
                ...viewByAttribute.items[0].attributeHeaderItem,
                attribute: viewByAttribute
            };

            const stackByItem = {
                ...stackByAttribute.items[0].attributeHeaderItem,
                attribute: stackByAttribute
            };

            const { afm } = dataSet.executionRequest;
            const drillContext = getDrillContext(stackByItem, viewByItem, measure, afm);
            expect(drillContext).toEqual([
                {
                    id: '1225',
                    identifier: 'label.owner.region',
                    uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1024',
                    value: 'East Coast'
                },
                {
                    id: '1226',
                    identifier: 'label.owner.department',
                    uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1027',
                    value: 'Direct Sales'
                },
                {
                    format: '#,##0.00',
                    id: 'amountMetric',
                    identifier: 'ah1EuQxwaCqs',
                    uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1279',
                    value: 'Amount'
                }
            ]);
        });

        it('should return correct drillContex for pie chart measures only', () => {
            const dataSet = fixtures.pieChartWithMetricsOnly;
            const [measureGroup] = getMVS(dataSet);
            const measure = measureGroup.items[0].measureHeaderItem;

            const viewByItem: any = null;
            const stackByItem: any = null;

            const { afm } = dataSet.executionRequest;
            const drillContext = getDrillContext(stackByItem, viewByItem, measure, afm);
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
                            },
                            {
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
                            },
                            {
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

        it('should assign custom xLabel', () => {
            expect(chartOptionsWithCustomOptions.title.x).toBe('xLabel');
        });

        it('should assign custom yLabel', () => {
            expect(chartOptionsWithCustomOptions.title.y).toBe('yLabel');
        });

        it('should assign custom yFormat', () => {
            expect(chartOptionsWithCustomOptions.title.yFormat).toBe('yFormat');
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

            it('should assign X axis name by default to view by attribute name instead of attribute display form name',
                () => {
                expect(chartOptions.title.x).toEqual('Year created');
            });

            it('should assign Y axis name to empty string in case of multiple measures', () => {
                expect(chartOptions.title.y).toBe('');
            });

            it('should assign Y axis format based on the first measure`s format', () => {
                expect(chartOptions.title.yFormat).toEqual('#,##0.00');
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

            it('should assign X axis name to view by attribute name', () => {
                expect(chartOptions.title.x).toEqual('Department');
            });

            it('should assign Y axis name to measure name', () => {
                expect(chartOptions.title.y).toBe('Amount');
            });

            it('should assign Y axis format based on the first measure`s format', () => {
                expect(chartOptions.title.yFormat).toEqual('#,##0.00');
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

        describe('in usecase of pie chart with attribute', () => {
            const chartOptions = generateChartOptions(fixtures.barChartWithViewByAttribute, { type: 'pie' });

            it('should assign stacking normal', () => {
                expect(chartOptions.stacking).toBe(null);
            });

            it('should assign X axis name to view by attribute name', () => {
                expect(chartOptions.title.x).toEqual('Department');
            });

            it('should assign Y axis name to measure name', () => {
                expect(chartOptions.title.y).toBe('Amount');
            });

            it('should assign Y axis format based on the first measure`s format', () => {
                expect(chartOptions.title.yFormat).toEqual('#,##0.00');
            });

            it('should always assign 1 series', () => {
                expect(chartOptions.data.series.length).toBe(1);
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

        describe('in usecase of pie chart with measures only', () => {
            const chartOptions = generateChartOptions(fixtures.pieChartWithMetricsOnly, { type: 'pie' });

            it('should assign stacking normal', () => {
                expect(chartOptions.stacking).toBe(null);
            });

            it('should assign X an empty string', () => {
                expect(chartOptions.title.x).toEqual('');
            });

            it('should assign Y an empty string', () => {
                expect(chartOptions.title.y).toBe('');
            });

            it('should assign Y axis format based on the first measure`s format', () => {
                expect(chartOptions.title.yFormat).toEqual('#,##0.00');
            });

            it('should always assign 1 series', () => {
                expect(chartOptions.data.series.length).toBe(1);
            });

            it('should assign categories with names of measures', () => {
                expect(chartOptions.data.categories).toEqual(['Won', 'Lost', 'Expected']);
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
                const tooltip = chartOptions.actions.tooltip(pointData);
                const expectedTooltip = generateTooltipFn(null, 'pie')(pointData);
                expect(tooltip).toBe(expectedTooltip);
            });
        });

        describe('in usecase of bar chart with pop measure', () => {
            const chartOptions =
                generateChartOptions(fixtures.barChartWithPopMeasureAndViewByAttribute, { type: 'column' });

            it('should assign stacking normal', () => {
                expect(chartOptions.stacking).toBe(null);
            });

            it('should assign X an view by attribute name instead of attribute display form name', () => {
                expect(chartOptions.title.x).toEqual('Year created');
            });

            it('should assign Y an empty string', () => {
                expect(chartOptions.title.y).toBe('');
            });

            it('should assign Y axis format based on the first measure`s format', () => {
                expect(chartOptions.title.yFormat).toEqual('$#,##0.00');
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

        describe('generate y axes', () => {
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
    });
});
