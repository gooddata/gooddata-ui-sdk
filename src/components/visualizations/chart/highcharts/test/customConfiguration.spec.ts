// (C) 2007-2018 GoodData Corporation
import get = require('lodash/get');
import set = require('lodash/set');
import noop = require('lodash/noop');
import { getCustomizedConfiguration } from '../customConfiguration';
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

    it('should handle "%" format on axis and use lable formater', () => {
        const chartOptionsWithFormat = immutableSet(chartOptions, 'yAxes[0].format', '0.00 %');
        const resultWithoutFormat = getCustomizedConfiguration(chartOptions);
        const resultWithFormat = getCustomizedConfiguration(chartOptionsWithFormat);

        expect(resultWithoutFormat.yAxis[0].labels.formatter).toBeUndefined();
        expect(resultWithFormat.yAxis[0].labels.formatter).toBeDefined();
    });

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
            visible: false
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
            visible: false,
            labels: {
                ...result.xAxis[0].labels,
                enabled: false,
                rotation: -60
            }
        };

        expect(result.xAxis[0]).toEqual(expectedResult);
    });

    it ('should set formatter for xAxis labels to prevent overlapping for bar chart with 90 rotation', () => {
        const result = getCustomizedConfiguration({
            ...chartOptions,
            type: 'bar',
            xAxisProps: {
                rotation: '90'
            }
        });

        expect(result.xAxis[0].labels.formatter).not.toBeUndefined();
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

    it('should NOT set connectNulls for NONstacked Area chart', () => {
        const result = getCustomizedConfiguration({
            ...chartOptions,
            type: VisualizationTypes.AREA,
            stacking: null
        });

        expect(result.plotOptions.series).toBeUndefined();
    });

    it('should NOT set connectNulls for stacked Line chart', () => {
        const result = getCustomizedConfiguration({
            ...chartOptions,
            stacking: 'normal'
        });

        expect(result.plotOptions.series.connectNulls).toBeUndefined();
    });

    describe('gridline configuration', () => {
        it('should set gridline width to 0 when grid is disabled', () => {
            const result = getCustomizedConfiguration({ ...chartOptions, grid: { enabled: false } });
            expect(result.yAxis[0].gridLineWidth).toEqual(0);
        });

        it('should set gridline width on xAxis on 0 for base chart when enabled', () => {
            const result = getCustomizedConfiguration({ ...chartOptions, grid: { enabled: true } });
            expect(result.xAxis[0].gridLineWidth).toEqual(0);
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
});
