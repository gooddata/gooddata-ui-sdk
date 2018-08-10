// (C) 2007-2018 GoodData Corporation
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
        y: 1
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

    it('should set gridline width to zero', () => {
        const result = getCustomizedConfiguration({ ...chartOptions, grid: { enabled: false } });
        expect(result.yAxis[0].gridLineWidth).toEqual(0);
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
            labels: {
                enabled: false
            },
            title: {
                text: '',
                enabled: false
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

    it ('should set startOnTick on true when min or max is not defined', () => {
        const result = getCustomizedConfiguration(chartOptions);

        expect(result.yAxis[0].startOnTick).toBeTruthy();
    });

    it ('should set startOnTick on false when min is bigger than 0 and max is not defined', () => {
        const result = getCustomizedConfiguration({
            ...chartOptions,
            yAxisProps: {
                min: 50
            }
        });

        expect(result.yAxis[0].startOnTick).toBeFalsy();
    });

    it ('should set endOnTick on true when min or max is not defined', () => {
        const result = getCustomizedConfiguration(chartOptions);

        expect(result.yAxis[0].endOnTick).toBeTruthy();
    });

    it ('should set endOnTick on false when max is bigger than 0 and min is not defined', () => {
        const result = getCustomizedConfiguration({
            ...chartOptions,
            yAxisProps: {
                max: 50
            }
        });

        expect(result.yAxis[0].endOnTick).toBeFalsy();
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

    describe('labels configuration', () => {
        it('should set two levels labels for multi-level heatmap', () => {
            const result = getCustomizedConfiguration({
                ...chartOptions,
                type: VisualizationTypes.TREEMAP,
                stacking: 'normal'
            });

            const treemapConfig = result.plotOptions.treemap;
            expect(treemapConfig.levels.length).toEqual(2);
        });

        it('should set one level labels for single-level heatmap', () => {
            const result = getCustomizedConfiguration({
                ...chartOptions,
                type: VisualizationTypes.TREEMAP,
                stacking: null
            });

            const treemapConfig = result.plotOptions.treemap;
            expect(treemapConfig.levels.length).toEqual(1);
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
