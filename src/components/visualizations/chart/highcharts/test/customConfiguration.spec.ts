// (C) 2007-2018 GoodData Corporation
import get = require('lodash/get');
import set = require('lodash/set');
import noop = require('lodash/noop');
import {
    escapeCategories,
    formatOverlapping,
    formatOverlappingForParentAttribute,
    getCustomizedConfiguration
} from '../customConfiguration';
import { ISeriesDataItem } from '../../chartOptionsBuilder';
import { VisualizationTypes } from '../../../../../constants/visualizationTypes';
import { immutableSet } from '../../../utils/common';

function getData(dataValues: ISeriesDataItem[]) {
    return {
        series: [
            {
                color: 'rgb(0, 0, 0)',
                name: '<b>aaa</b>',
                data: dataValues
            }
        ]
    };
}

const chartOptions = {
    type: VisualizationTypes.LINE,
    yAxes: [{ title: 'atitle' }],
    xAxes: [{ title: 'xtitle' }],
    data: getData([{
        name: '<b>bbb</b>',
        y: 10
    }, null])
};

describe('getCustomizedConfiguration', () => {
    it('should escape series names', () => {
        const result = getCustomizedConfiguration(chartOptions);
        expect(result.series[0].name).toEqual('&lt;b&gt;aaa&lt;/b&gt;');
    });

    it('should escape data items in series', () => {
        const result = getCustomizedConfiguration(chartOptions);
        expect(result.series[0].data[0].name).toEqual('&lt;b&gt;bbb&lt;/b&gt;');
    });

    it('should handle "%" format on axis and use label formatter', () => {
        const chartOptionsWithFormat = immutableSet(chartOptions, 'yAxes[0].format', '0.00 %');
        const resultWithoutFormat = getCustomizedConfiguration(chartOptions);
        const resultWithFormat = getCustomizedConfiguration(chartOptionsWithFormat);

        expect(resultWithoutFormat.yAxis[0].labels.formatter).toBeUndefined();
        expect(resultWithFormat.yAxis[0].labels.formatter).toBeDefined();
    });

    it ('should set formatter for xAxis labels to prevent overlapping for bar chart with 90 rotation', () => {
        const result = getCustomizedConfiguration({
            ...chartOptions,
            type: 'bar',
            xAxisProps: {
                rotation: '90'
            }
        });

        expect(result.xAxis[0].labels.formatter).toBe(formatOverlapping);
    });

    it ('should set formatter for xAxis labels to prevent overlapping for stacking bar chart with 90 rotation', () => {
        const result = getCustomizedConfiguration({
            ...chartOptions,
            isViewByTwoAttributes: true,
            type: 'bar',
            xAxisProps: {
                rotation: '90'
            }
        });

        expect(result.xAxis[0].labels.formatter).toBe(formatOverlappingForParentAttribute);
    });

    it ('shouldn\'t set formatter for xAxis by default', () => {
        const result = getCustomizedConfiguration(chartOptions);

        expect(result.xAxis[0].labels.formatter).toBeUndefined();
    });

    it('should set connectNulls for stacked Area chart', () => {
        const result = getCustomizedConfiguration({
            ...chartOptions,
            type: VisualizationTypes.AREA,
            stacking: 'normal'
        });

        expect(result.plotOptions.series.connectNulls).toBeTruthy();
    });

    it('should NOT set connectNulls for NON stacked Area chart', () => {
        const result = getCustomizedConfiguration({
            ...chartOptions,
            type: VisualizationTypes.AREA,
            stacking: null
        });

        expect(result.plotOptions.series).toEqual({});
    });

    it('should NOT set connectNulls for stacked Line chart', () => {
        const result = getCustomizedConfiguration({
            ...chartOptions,
            stacking: 'normal'
        });

        expect(result.plotOptions.series.connectNulls).toBeUndefined();
    });

    describe('getAxesConfiguration', () => {
        it('should set Y axis configuration from properties', () => {
            const result = getCustomizedConfiguration({
                    ...chartOptions,
                    yAxisProps: {
                        min: 20,
                        max: 30,
                        labelsEnabled: false,
                        visible: false
                    }
                });

            const expectedResult = {
                ...result.yAxis[0],
                min: 20,
                max: 30,
                labels: {
                    ...result.yAxis[0].labels,
                    enabled: false
                },
                title: {
                    ...result.yAxis[0].title,
                    enabled: false,
                    text: ''
                }
            };
            expect(result.yAxis[0]).toEqual(expectedResult);
        });

        it ('should set X axis configurations from properties', () => {
            const result = getCustomizedConfiguration({
                ...chartOptions,
                xAxisProps: {
                    visible: false,
                    labelsEnabled: false,
                    rotation: '60'
                }
            });

            const expectedResult = {
                ...result.xAxis[0],
                title: {
                    ...result.xAxis[0].title,
                    enabled: false,
                    text: ''
                },
                labels: {
                    ...result.xAxis[0].labels,
                    enabled: false,
                    rotation: -60
                }
            };

            expect(result.xAxis[0]).toEqual(expectedResult);
        });

        it('should enable axis label for scatter plot when x and y are not set', () => {
            const result = getCustomizedConfiguration({
                ...chartOptions,
                type: VisualizationTypes.SCATTER
            });

            const expectedXAxisResult = {
                ...result.xAxis[0],
                labels: {
                    ...result.xAxis[0].labels,
                    enabled: true
                }
            };
            const expectedYAxisResult = {
                ...result.yAxis[0],
                labels: {
                    ...result.yAxis[0].labels,
                    enabled: true
                }
            };

            expect(result.xAxis[0]).toEqual(expectedXAxisResult);
            expect(result.yAxis[0]).toEqual(expectedYAxisResult);
        });

        it('should disable xAxis labels when x axis is disabled in scatter', () => {
            const result = getCustomizedConfiguration({
                ...chartOptions,
                xAxisProps: {
                    visible: false
                },
                type: VisualizationTypes.SCATTER
            });

            const expectedXAxisResult = {
                ...result.xAxis[0],
                labels: {
                    ...result.xAxis[0].labels,
                    enabled: false
                }
            };
            const expectedYAxisResult = {
                ...result.yAxis[0],
                labels: {
                    ...result.yAxis[0].labels,
                    enabled: true
                }
            };

            expect(result.xAxis[0]).toEqual(expectedXAxisResult);
            expect(result.yAxis[0]).toEqual(expectedYAxisResult);
        });

        it('should disable labels when labels are disabled in bubble', () => {
            const result = getCustomizedConfiguration({
                ...chartOptions,
                xAxisProps: {
                    labelsEnabled: false
                },
                type: VisualizationTypes.BUBBLE
            });

            const expectedXAxisResult = {
                ...result.xAxis[0],
                labels: {
                    ...result.xAxis[0].labels,
                    enabled: false
                }
            };
            const expectedYAxisResult = {
                ...result.yAxis[0],
                labels: {
                    ...result.yAxis[0].labels,
                    enabled: true
                }
            };

            expect(result.xAxis[0]).toEqual(expectedXAxisResult);
            expect(result.yAxis[0]).toEqual(expectedYAxisResult);
        });

        it('should enable labels for heatmap when categories are not empty', () => {
            const result = getCustomizedConfiguration({
                ...chartOptions,
                data: {
                    ...chartOptions.data,
                    categories: ['c1', 'c2']
                },
                type: VisualizationTypes.HEATMAP
            });

            const expectedXAxisResult = {
                ...result.xAxis[0],
                labels: {
                    ...result.xAxis[0].labels,
                    enabled: true
                }
            };
            const expectedYAxisResult = {
                ...result.yAxis[0],
                labels: {
                    ...result.yAxis[0].labels,
                    enabled: true
                }
            };

            expect(result.xAxis[0]).toEqual(expectedXAxisResult);
            expect(result.yAxis[0]).toEqual(expectedYAxisResult);
        });

        it('should disable lables for heatmap when categories are empty', () => {
            const result = getCustomizedConfiguration({
                ...chartOptions,
                data: {
                    ...chartOptions.data,
                    categories: []
                },
                type: VisualizationTypes.HEATMAP
            });

            const expectedXAxisResult = {
                ...result.xAxis[0],
                labels: {
                    ...result.xAxis[0].labels,
                    enabled: false
                }
            };
            const expectedYAxisResult = {
                ...result.yAxis[0],
                labels: {
                    ...result.yAxis[0].labels,
                    enabled: false
                }
            };

            expect(result.xAxis[0]).toEqual(expectedXAxisResult);
            expect(result.yAxis[0]).toEqual(expectedYAxisResult);
        });

        it('should set extremes for y axis when x axis scale changed', () => {
            const result = getCustomizedConfiguration({
                    ...chartOptions,
                    xAxisProps: {
                        min: 20,
                        max: 30
                    }
                });

            const expectedPlotOptions = {
                    getExtremesFromAll: true
            };
            expect(result.plotOptions.series).toEqual(expectedPlotOptions);
        });

        it('should set axis line width to 1 in scatter plot when axis is enabled', () => {
            const result = getCustomizedConfiguration({
                ...chartOptions,
                yAxisProps: {
                    visible: true
                },
                xAxisProps: {
                    visible: true
                },
                type: VisualizationTypes.SCATTER
            });

            expect(result.xAxis[0].lineWidth).toEqual(1);
            expect(result.yAxis[0].lineWidth).toEqual(1);
        });

        it('should not set axis line when in column and axis is enabled', () => {
            const result = getCustomizedConfiguration({
                ...chartOptions,
                yAxisProps: {
                    visible: true
                },
                xAxisProps: {
                    visible: true
                },
                type: VisualizationTypes.COLUMN
            });

            expect(result.xAxis[0].lineWidth).toBeUndefined();
            expect(result.yAxis[0].lineWidth).toBeUndefined();
        });

        it('should set axis line width to 0 when axis is disabled', () => {
            const result = getCustomizedConfiguration({
                ...chartOptions,
                yAxisProps: {
                    visible: false
                },
                xAxisProps: {
                    visible: false
                }
            });

            expect(result.xAxis[0].lineWidth).toEqual(0);
            expect(result.yAxis[0].lineWidth).toEqual(0);
        });
    });

    describe('gridline configuration', () => {
        it('should set gridline width to 0 when grid is disabled', () => {
            const result = getCustomizedConfiguration({ ...chartOptions, grid: { enabled: false } });
            expect(result.yAxis[0].gridLineWidth).toEqual(0);
        });

        it('should set gridline width on xAxis on 1 for Scatterplot when enabled', () => {
            const customConfig = { grid: { enabled: true }, type: VisualizationTypes.SCATTER };
            const result = getCustomizedConfiguration({ ...chartOptions, ...customConfig });
            expect(result.xAxis[0].gridLineWidth).toEqual(1);
        });

        it('should set gridline width on xAxis on 1 for Bubblechart when enabled', () => {
            const customConfig = { grid: { enabled: true }, type: VisualizationTypes.BUBBLE };
            const result = getCustomizedConfiguration({ ...chartOptions, ...customConfig });
            expect(result.xAxis[0].gridLineWidth).toEqual(1);
        });

        it('should set gridline width on xAxis on 0 for Scatterplot when disabled', () => {
            const customConfig = { grid: { enabled: false }, type: VisualizationTypes.SCATTER };
            const result = getCustomizedConfiguration({ ...chartOptions, ...customConfig });
            expect(result.xAxis[0].gridLineWidth).toEqual(0);
        });

        it('should set gridline width on xAxis on 0 for Bubblechart when disabled', () => {
            const customConfig = { grid: { enabled: false }, type: VisualizationTypes.BUBBLE };
            const result = getCustomizedConfiguration({ ...chartOptions, ...customConfig });
            expect(result.xAxis[0].gridLineWidth).toEqual(0);
        });
    });

    describe('labels configuration', () => {
        it('should set two levels labels for multi-level treemap', () => {
            const result = getCustomizedConfiguration({
                ...chartOptions,
                type: VisualizationTypes.TREEMAP,
                stacking: 'normal'
            });

            const treemapConfig = result.plotOptions.treemap;
            expect(treemapConfig.levels.length).toEqual(2);
        });

        it('should set one level labels for single-level treemap', () => {
            const result = getCustomizedConfiguration({
                ...chartOptions,
                type: VisualizationTypes.TREEMAP,
                stacking: null
            });

            const treemapConfig = result.plotOptions.treemap;
            expect(treemapConfig.levels.length).toEqual(1);
        });

        it('should set global HCH dataLabels config according user config for treemap', () => {
            const result = getCustomizedConfiguration(
                {
                    ...chartOptions,
                    type: VisualizationTypes.TREEMAP,
                    stacking: null
                },
                {
                    dataLabels: {
                        visible: true
                    }
                }
            );

            const treemapConfig = result.plotOptions.treemap;
            expect(treemapConfig.dataLabels).toEqual({
                allowOverlap: true,
                enabled: true
            });
        });

        describe('bubble dataLabels formatter', () => {
            function setMinMax(obj: any, xAxisMin: number, xAxisMax: number, yAxisMin: number, yAxisMax: number) {
                set(obj, 'series.xAxis.min', xAxisMin);
                set(obj, 'series.xAxis.max', xAxisMax);
                set(obj, 'series.yAxis.min', yAxisMin);
                set(obj, 'series.yAxis.max', yAxisMax);
            }

            function setPoint(obj: any, x: number, y: number, z: number) {
                set(obj, 'x', x);
                set(obj, 'y', y);
                set(obj, 'point.z', z);
            }

            it('should draw label when bubble is inside chart area', () => {
                const result = getCustomizedConfiguration(
                    {
                        ...chartOptions,
                        type: VisualizationTypes.BUBBLE
                    },
                    {
                        dataLabels: {
                            visible: true
                        }
                    }
                );

                setMinMax(result, 0, 10, 0, 10);
                setPoint(result, 5, 10, 5);

                const bubbleFormatter = get(result, 'plotOptions.bubble.dataLabels.formatter', noop).bind(result);

                expect(bubbleFormatter()).toEqual('5');
            });

            it('should not draw dataLabel when label is outside chart area', () => {
                const result = getCustomizedConfiguration(
                    {
                        ...chartOptions,
                        type: VisualizationTypes.BUBBLE
                    },
                    {
                        dataLabels: {
                            visible: true
                        }
                    }
                );

                setMinMax(result, 0, 10, 0, 10);
                setPoint(result, 5, 11, 5);

                const bubbleFormatter = get(result, 'plotOptions.bubble.dataLabels.formatter', noop).bind(result);

                expect(bubbleFormatter()).toEqual(null);
            });

            it('should show data label when min and max are not defined', () => {
                const result = getCustomizedConfiguration(
                    {
                        ...chartOptions,
                        type: VisualizationTypes.BUBBLE
                    },
                    {
                        dataLabels: {
                            visible: true
                        }
                    }
                );

                setPoint(result, 5, 11, 5);

                const bubbleFormatter = get(result, 'plotOptions.bubble.dataLabels.formatter', noop).bind(result);

                expect(bubbleFormatter()).toEqual('5');
            });
        });
    });

    describe('tooltip followPointer', () => {
        it ('should follow pointer for bar chart when data max is above axis max', () => {
            const result = getCustomizedConfiguration({
                ...chartOptions,
                actions: { tooltip: true },
                data: getData([{ y: 100 }, { y: 101 }]),
                type: VisualizationTypes.COLUMN,
                yAxisProps: {
                    max: 50
                }
            });

            expect(result.tooltip.followPointer).toBeTruthy();
        });

        it ('should not follow pointer for bar chart when data max is below axis max', () => {
            const result = getCustomizedConfiguration({
                ...chartOptions,
                actions: { tooltip: true },
                data: getData([{ y: 0 }, { y: 1 }]),
                type: VisualizationTypes.COLUMN,
                yAxisProps: {
                    max: 50
                }
            });

            expect(result.tooltip.followPointer).toBeFalsy();
        });

        it ('should follow pointer for pie chart should be false by default', () => {
            const result = getCustomizedConfiguration({
                ...chartOptions,
                actions: { tooltip: true },
                data: getData([{ y: 100 } , { y: 101 }]),
                type: VisualizationTypes.PIE,
                yAxisProps: {
                    max: 50
                }
            });

            expect(result.tooltip.followPointer).toBeFalsy();
        });
    });

    describe('format data labels', () => {
        const getDataLabelPoint = (opposite = false, axisNumber = 1) => ({
            y: 1000,
            percentage: 55.55,
            series: {
                chart: {
                    yAxis: Array(axisNumber).fill({})
                },
                yAxis: {
                    opposite
                }
            },
            point: {
                format: '#,##0.00'
            }
        });

        it('should return number for not supported chart', () => {
            const chartOptions = { type: VisualizationTypes.LINE, yAxes: [{}] };
            const configuration = getCustomizedConfiguration(chartOptions);
            const formatter = get(configuration, 'plotOptions.bar.dataLabels.formatter', noop);
            const dataLabelPoint = getDataLabelPoint();
            const dataLabel = formatter.call(dataLabelPoint);
            expect(dataLabel).toBe('1,000.00');
        });

        it.each([
            ['should return number for single axis chart without \'Stack to 100%\'', 1],
            ['should return number for dual axis chart without \'Stack to 100%\'', 2]
        ])('%s', (_description: string, axisNumber: number) => {
            const chartOptions = { type: VisualizationTypes.COLUMN, yAxes: Array(axisNumber).fill({}) };
            const configuration = getCustomizedConfiguration(chartOptions);
            const formatter = get(configuration, 'plotOptions.bar.dataLabels.formatter', noop);
            const dataLabelPoint = getDataLabelPoint(false, axisNumber);
            const dataLabel = formatter.call(dataLabelPoint);
            expect(dataLabel).toBe('1,000.00');
        });

        it.each([
            ['should return percentage for left single axis chart with \'Stack to 100%\'', false, 1, '55.55%'],
            ['should return percentage for right single axis chart with \'Stack to 100%\'', true, 1, '55.55%'],
            ['should return percentage for primary axis for dual chart with \'Stack to 100%\'', false, 2, '55.55%'],
            ['should return number for secondary axis for dual chart with \'Stack to 100%\'', true, 2, '1,000.00']
        ])('%s', (_description: string, opposite: boolean, axisNumber: number, expectation: string) => {
            const chartOptions = { type: VisualizationTypes.COLUMN, yAxes: Array(axisNumber).fill({}) };
            const config = { stackMeasuresToPercent: true };
            const configuration = getCustomizedConfiguration(chartOptions, config);
            const formatter = get(configuration, 'plotOptions.bar.dataLabels.formatter', noop);
            const dataLabelPoint = getDataLabelPoint(opposite, axisNumber);
            const dataLabel = formatter.call(dataLabelPoint);
            expect(dataLabel).toBe(expectation);
        });
    });
});

describe('escapeCategories', () => {
    it('should escape string categories', () => {
        const categories = escapeCategories(['cat1', '<cat2/>', '<cat3></cat3>']);
        expect(categories).toEqual([
            'cat1',
            '&lt;cat2/&gt;',
            '&lt;cat3&gt;&lt;/cat3&gt;'
        ]);
    });

    it('should escape object categories', () => {
        const categories = escapeCategories([{
            name: 'Status',
            categories: ['cat1', '<cat2/>', '<cat3></cat3>']
        }]);
        expect(categories).toEqual([{
            name: 'Status',
            categories: [
                'cat1',
                '&lt;cat2/&gt;',
                '&lt;cat3&gt;&lt;/cat3&gt;'
            ]
        }]);
    });
});
