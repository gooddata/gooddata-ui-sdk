// (C) 2007-2018 GoodData Corporation
import getOptionalStackingConfiguration, {
    convertMinMaxFromPercentToNumber,
    getParentAttributeConfiguration,
    getShowInPercentConfiguration,
    getStackMeasuresConfiguration
} from '../getOptionalStackingConfiguration';
import { IChartConfig, VisualizationTypes } from '../../../../..';
import { IChartOptions } from '../../chartOptionsBuilder';

describe('getOptionalStackingConfiguration', () => {

    it('should return empty configuration to not supported chart type', () => {
        expect(getOptionalStackingConfiguration(({ type: VisualizationTypes.LINE }), undefined)).toEqual({});
    });

    describe('getParentAttributeConfiguration', () => {

        it.each([
            [VisualizationTypes.COLUMN, {
                xAxis: [{
                    labels: {
                        groupedOptions: [{
                            style: { fontWeight: 'bold' }
                        }]
                    }
                }]
            }],
            [VisualizationTypes.BAR, {
                xAxis: [{
                    labels: {
                        groupedOptions: [{
                            style: { fontWeight: 'bold' },
                            x: -5
                        }]
                    }
                }]
            }]
        ])('should return parent attribute configuration for %s chart', (type: string, expectedConfig: any) => {
            const chartOptions = { type };
            const config = { xAxis: [{}] };
            const result = getParentAttributeConfiguration(chartOptions, config);

            expect(result).toEqual(expectedConfig);
        });
    });

    describe('getStackMeasuresConfiguration', () => {

        it.each([
            ['undefined', {}],
            ['false', {
                stackMeasures: false,
                stackMeasuresToPercent: false
            }]
        ])('should return empty configuration when stack options are %s', (_: string, chartConfig: IChartConfig) => {
            const result = getStackMeasuresConfiguration({ type: VisualizationTypes.COLUMN }, {}, chartConfig);
            expect(result).toEqual({});
        });

        it.each([
            ['should return series config with normal stacking', {
                yAxes: [{}]
            }, {
                series: [{ yAxis: 0 }]
            }, {
                stackMeasures: true
            }, {
                stackMeasuresToPercent: false,
                series: [{
                    yAxis: 0,
                    stack: 0,
                    stacking: 'normal'
                }]
            }],
            ['should return series config with percent stacking', {
                yAxes: [{}]
            }, {
                series: [{ yAxis: 0 }]
            }, {
                stackMeasuresToPercent: true
            }, {
                stackMeasuresToPercent: true,
                series: [{
                    yAxis: 0,
                    stack: 0,
                    stacking: 'percent'
                }]
            }],
            ['should \'stackMeasuresToPercent\' always overwrite \'stackMeasures\' setting', {
                yAxes: [{}] // single axis chart
            }, {
                series: [{ yAxis: 0 }] // single axis chart
            }, {
                stackMeasures: true,
                stackMeasuresToPercent: true
            }, {
                stackMeasuresToPercent: true,
                series: [{
                    yAxis: 0,
                    stack: 0,
                    stacking: 'percent'
                }]
            }],
            ['should return series config with normal stacking for dual axis', {
                yAxes: [{}, {}] // dual axis chart
            }, {
                series: [{
                    yAxis: 0
                }, {
                    yAxis: 1
                }],
                yAxis: [{}, {}]
            }, {
                stackMeasures: true
            }, {
                stackMeasuresToPercent: false,
                series: [{
                    yAxis: 0, // primary Y axis
                    stack: 0,
                    stacking: 'normal'
                }, {
                    yAxis: 1, // secondary Y axis
                    stack: 1,
                    stacking: 'normal'
                }],
                yAxis: Array(2).fill({
                    stackLabels: { enabled: true }
                })
            }],
            ['should only apply \'stackMeasuresToPercent\' to primary Y axis for dual axis chart', {
                yAxes: [{}, {}] // dual axis chart
            }, {
                series: [{
                    yAxis: 0
                }, {
                    yAxis: 1
                }],
                yAxis: [{}, {}]
            }, {
                stackMeasuresToPercent: true
            }, {
                stackMeasuresToPercent: true,
                series: [{
                    yAxis: 0, // primary Y axis
                    stack: 0,
                    stacking: 'percent'
                }, {
                    yAxis: 1, // secondary Y axis
                    stack: 1,
                    stacking: 'normal'
                }]
            }]
        ])('%s', (
            _: string,
            chartOptions: IChartOptions,
            config: any,
            chartConfig: IChartConfig,
            expectedConfig: any
        ) => {
            const result = getStackMeasuresConfiguration({
                type: VisualizationTypes.COLUMN,
                ...chartOptions
            }, config, chartConfig);
            expect(result).toMatchObject(expectedConfig);
        });

        it('should \'stackLabels.enabled\' be followed by \'dataLabels.visible\' setting', () => {
            const chartOptions = {
                type: VisualizationTypes.COLUMN,
                yAxes: [{}, {}] // dual axis chart
            };
            const config = {
                series: [{
                    yAxis: 0
                }, {
                    yAxis: 1
                }],
                // 'stackLabels.enabled' is already calculated in
                // customConfiguration.ts:getStackingConfiguration via 'dataLabels.visible'
                yAxis: Array(2).fill({ stackLabels: {
                    enabled: false
                }})
            };
            const chartConfig = {
                stackMeasures: true
            };
            const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
            expect(result).toMatchObject({
                yAxis: Array(2).fill({
                    stackLabels: { enabled: false }
                })
            });
        });

        it('should not return \'yAxis.stackLabels\' to bar chart by default', () => {
            // the template in 'barConfiguration.ts' turns stackLabels off by default
            const chartOptions = {
                type: VisualizationTypes.BAR,
                yAxes: [{}]
            };
            const config = {
                series: [{ yAxis: 0 }],
                yAxis: [{}]
            };
            const chartConfig = {
                stackMeasures: true
            };
            const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
            expect(result).not.toHaveProperty('yAxis.stackLabels');
        });
    });

    describe('getShowInPercentConfiguration', () => {
        it('should not add formatter when \'stackMeasuresToPercent\' is false', () => {
            const chartConfig = {
                stackMeasuresToPercent: false
            };
            const result = getShowInPercentConfiguration(undefined, undefined, chartConfig);
            expect(result).toEqual({});
        });

        it('should add formatter when \'stackMeasuresToPercent\' is true', () => {
            const chartOptions = {
                yAxes: [{}]
            };
            const chartConfig = {
                stackMeasuresToPercent: true
            };
            const result: any = getShowInPercentConfiguration(chartOptions, undefined, chartConfig);
            expect(result.yAxis[0]).toHaveProperty('labels.formatter');
        });
    });

    describe('convertMinMaxFromPercentToNumber', () => {
        it('should not convert min/max to percent', () => {
            const chartConfig = {
                stackMeasuresToPercent: false
            };
            const result = convertMinMaxFromPercentToNumber(undefined, undefined, chartConfig);
            expect(result).toEqual({});
        });

        it.each([
            ['left Y axis for single axis chart', {
                yAxis: [{
                    min: 0.1,
                    max: 0.9,
                    opposite: false
                }]
            }, {
                yAxis: [{
                    min: 10,
                    max: 90,
                    opposite: false
                }]
            }],
            ['right Y axis for single axis chart', {
                yAxis: [{
                    min: 0.1,
                    max: 0.9,
                    opposite: true
                }]
            }, {
                yAxis: [{
                    min: 10,
                    max: 90,
                    opposite: true
                }]
            }],
            ['primary Y axis for dual axis chart', {
                yAxis: [{
                    min: 0.1,
                    max: 0.9,
                    opposite: false
                }, {
                    min: 1000,
                    max: 9000,
                    opposite: true
                }]
            }, {
                yAxis: [{
                    min: 10,
                    max: 90,
                    opposite: false
                }, {
                    min: 1000,
                    max: 9000,
                    opposite: true
                }]
            }]
        ])('should convert min/max for %s', (_: string, config: any, expectedConfig: any) => {
            const result = convertMinMaxFromPercentToNumber(undefined, config, { stackMeasuresToPercent: true });
            expect(result).toEqual(expectedConfig);
        });
    });
});
