// (C) 2007-2018 GoodData Corporation
import getOptionalStackingConfiguration, {
    convertMinMaxFromPercentToNumber,
    getParentAttributeConfiguration,
    getShowInPercentConfiguration,
    getStackMeasuresConfiguration,
    getYAxisConfiguration
} from '../getOptionalStackingConfiguration';
import { IChartConfig, VisualizationTypes } from '../../../../..';

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
            ['normal', { stackMeasures: true }, { stackMeasuresToPercent: false }],
            ['percent', { stackMeasuresToPercent: true }, { stackMeasuresToPercent: true }]
        ])('should return series config with %s stacking', (
            type: string,
            chartConfig: IChartConfig,
            expected: any
        ) => {
            const chartOptions = { yAxes: [{}] };
            const config = { series: Array(2).fill({ yAxis: 0 }) };

            const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
            expect(result).toEqual({
                ...expected,
                series: Array(2).fill({
                    yAxis: 0,
                    stack: 0,
                    stacking: type
                })
            });
        });

        it('should "stackMeasuresToPercent" always overwrite "stackMeasures" setting', () => {
            const chartOptions = { yAxes: [{}] };
            const config = { series: Array(2).fill({ yAxis: 0 }) };
            const chartConfig = {
                stackMeasures: true,
                stackMeasuresToPercent: true
            };

            const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
            expect(result).toEqual({
                stackMeasuresToPercent: true,
                series: Array(2).fill({
                    yAxis: 0,
                    stack: 0,
                    stacking: 'percent'
                })
            });
        });

        it('should return series with stacking config with normal stacking for dual axis', () => {
            const chartOptions = {
                type: VisualizationTypes.COLUMN,
                yAxes: [{}, {}]
            };
            const config = {
                yAxis: [{}, {}],
                series: [
                    ...Array(2).fill({ yAxis: 0 }),
                    ...Array(2).fill({ yAxis: 1 })
                ]
            };
            const chartConfig = { stackMeasures: true };

            const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
            expect(result).toEqual({
                stackMeasuresToPercent: false,
                series: [
                    ...Array(2).fill({
                        yAxis: 0, // primary Y axis
                        stack: 0,
                        stacking: 'normal'
                    }),
                    ...Array(2).fill({
                        yAxis: 1, // secondary Y axis
                        stack: 1,
                        stacking: 'normal'
                    })
                ],
                yAxis: Array(2).fill({
                    stackLabels: { enabled: true }
                })
            });
        });

        it.each([
            ['stackMeasures', false],
            ['stackMeasuresToPercent', true]
        ])('should return series without "%s" config with one measure in each axis for dual axis', (
            stackMeasuresType: string,
            expectedStackMeasuresToPercent: boolean
        ) => {
            const chartOptions = {
                type: VisualizationTypes.COLUMN,
                yAxes: [{}, {}]
            };
            const config = {
                yAxis: [{}, {}],
                series: [{
                    yAxis: 0
                }, {
                    yAxis: 1
                }]
            };
            const chartConfig = { [stackMeasuresType]: true };

            const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
            expect(result).toEqual({
                stackMeasuresToPercent: expectedStackMeasuresToPercent,
                series: [{
                    yAxis: 0, // primary Y axis
                    stack: null,
                    stacking: null
                }, {
                    yAxis: 1, // secondary Y axis
                    stack: null,
                    stacking: null
                }],
                yAxis: Array(2).fill({
                    stackLabels: { enabled: true }
                })
            });
        });

        it('should return series without "stackMeasures" config with one measure in each axis for dual axis', () => {
            const chartOptions = {
                type: VisualizationTypes.COLUMN,
                yAxes: [{}, {}]
            };
            const config = {
                yAxis: [{}, {}],
                series: [{
                    yAxis: 0
                }, {
                    yAxis: 1
                }]
            };
            const chartConfig = { stackMeasures: true };

            const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
            expect(result).toEqual({
                stackMeasuresToPercent: false,
                series: [{
                    yAxis: 0, // primary Y axis
                    stack: null,
                    stacking: null
                }, {
                    yAxis: 1, // secondary Y axis
                    stack: null,
                    stacking: null
                }],
                yAxis: Array(2).fill({
                    stackLabels: { enabled: true }
                })
            });
        });

        it.each([
            ['', true],
            ['', 'auto'],
            [' not', false]
        ])('should%s show stack label when "dataLabel.visible" is %s', (
            _negation: string, visible: boolean | string
        ) => {
            const chartOptions = {
                type: VisualizationTypes.COLUMN,
                yAxes: [{}]
            };
            const config = {
                series: [{ yAxis: 0 }],
                yAxis: [{}]
            };
            const chartConfig = {
                stackMeasures: true,
                dataLabels: { visible }
            };
            const { yAxis }: any = getStackMeasuresConfiguration(chartOptions, config, chartConfig);

            expect(yAxis).toEqual(Array(1).fill({
                stackLabels: { enabled: Boolean(visible) }
            }));
        });

        it('should not return "yAxis.stackLabels" to bar chart by default', () => {
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

        describe('getYAxisConfiguration', () => {
            it('should return empty config with not column chart type', () => {
                const chartOptions = { type: VisualizationTypes.BAR };
                const config = {};
                const chartConfig = {};

                const result = getYAxisConfiguration(chartOptions, config, chartConfig);
                expect(result).toEqual({});
            });

            it('should disable stack labels when "stackMeasuresToPercent" is on and having negative value', () => {
                const chartOptions = { type: VisualizationTypes.COLUMN };
                const config = {
                    yAxis: [{}],
                    series: [{
                        yAxis: 0,
                        data: [{
                            y: 100
                        }, {
                            y: -50
                        }]
                    }]
                };
                const chartConfig = {
                    stackMeasuresToPercent: true,
                    dataLabels: { enabled: true }
                };

                const result = getYAxisConfiguration(chartOptions, config, chartConfig);
                expect(result).toEqual({
                    yAxis: [{
                        stackLabels: { enabled: false }
                    }]
                });
            });

            it('should not disable stack labels when "stackMeasuresToPercent" is on and having positive value', () => {
                const chartOptions = { type: VisualizationTypes.COLUMN };
                const config = {
                    yAxis: [{}],
                    series: [{
                        yAxis: 0,
                        data: [{
                            y: 100
                        }, {
                            y: 50
                        }]
                    }]
                };
                const chartConfig = {
                    stackMeasuresToPercent: true,
                    dataLabels: { enabled: true }
                };

                const result = getYAxisConfiguration(chartOptions, config, chartConfig);
                expect(result).toEqual({
                    yAxis: [{
                        stackLabels: { enabled: true }
                    }]
                });
            });

            it('should disable stack labels only on left axis with dual chart', () => {
                const chartOptions = { type: VisualizationTypes.COLUMN };
                const config = {
                    yAxis: [{}, {}], // dual axis chart
                    series: [{
                        yAxis: 0, // left measure
                        data: [{
                            y: 100
                        }, {
                            y: -50 // has negative value
                        }]
                    }, {
                        yAxis: 1, // right measure
                        data: [{
                            y: 100
                        }, {
                            y: 50
                        }]
                    }]
                };
                const chartConfig = {
                    stackMeasuresToPercent: true,
                    dataLabels: { enabled: true }
                };

                const result = getYAxisConfiguration(chartOptions, config, chartConfig);
                expect(result).toEqual({
                    yAxis: [{
                        stackLabels: { enabled: false }
                    }, {
                        stackLabels: { enabled: true }
                    }]
                });
            });
        });
    });

    describe('getShowInPercentConfiguration', () => {
        it('should not add formatter when "stackMeasuresToPercent" is false', () => {
            const chartConfig = {
                stackMeasuresToPercent: false
            };
            const result = getShowInPercentConfiguration(undefined, undefined, chartConfig);
            expect(result).toEqual({});
        });

        it('should not add formatter when "stackMeasuresToPercent" is true and one measure', () => {
            const chartOptions = {
                yAxes: [{}],
                data: {
                    series: [{ yAxis: 0 }]
                }
            };
            const chartConfig = {
                stackMeasuresToPercent: true
            };
            const result = getShowInPercentConfiguration(chartOptions, undefined, chartConfig);
            expect(result).toEqual({});
        });

        it('should add formatter when "stackMeasuresToPercent" is true and two measures', () => {
            const chartOptions = {
                yAxes: [{}],
                data: {
                    series: Array(2).fill({ yAxis: 0 })
                }
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
                    max: 90
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
                    max: 90
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
                    max: 90
                }, {}]
            }]
        ])('should convert min/max for %s', (_: string, config: any, expectedConfig: any) => {
            const result = convertMinMaxFromPercentToNumber(undefined, config, { stackMeasuresToPercent: true });
            expect(result).toEqual(expectedConfig);
        });
    });
});
