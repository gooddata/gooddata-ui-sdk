// (C) 2007-2018 GoodData Corporation
import {
    shouldFollowPointer,
    shouldStartOrEndOnTick,
    getChartProperties,
    pointInRange,
    getStackedMaxValue,
    getStackedMinValue
} from '../helpers';
import { VisualizationTypes } from '../../../../../constants/visualizationTypes';
import { IChartConfig } from '../../Chart';

describe('helpers', () => {
    describe('getChartProperties', () => {
        const config: IChartConfig = {
            xaxis: {
                rotation: '60',
                visible: false
            },
            yaxis: {
                labelsEnabled: true
            }
        };

        it('should return properties from config', () => {
            expect(getChartProperties(config, VisualizationTypes.COLUMN))
                .toEqual({
                    xAxisProps: { rotation: '60', visible: false },
                    yAxisProps: { labelsEnabled: true }
                });
        });

        it('should return properties from config for bar chart with switched axes', () => {
            expect(getChartProperties(config, VisualizationTypes.BAR))
                .toEqual({
                    yAxisProps: { rotation: '60', visible: false },
                    xAxisProps: { labelsEnabled: true }
                });
        });
    });

    describe('shouldStartOrEndOnTick', () => {
        const nonStackedChartOptions = {
            hasStackByAttribute: false,
            data: {
                series: [
                    {
                        data: [{ y: 20 }],
                        visible: true
                    }
                ]
            }
        };

        const stackedChartOptions = {
            hasStackByAttribute: true,
            data: {
                series: [
                    {
                        data: [
                            { y: 20 },
                            { y: 10 },
                            { y: 5 }
                        ],
                        visible: true
                    }
                ]
            }
        };

        describe('Non stacked chart', () => {
            it('should return false when min and max are set', () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: { min: '5', max: '10' }
                };
                expect(shouldStartOrEndOnTick(chartOptions)).toBeFalsy();
            });

            it('should return false when min is greater than max', () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: { min: '10', max: '5' }
                };

                expect(shouldStartOrEndOnTick(chartOptions)).toBeTruthy();
            });

            it('should return false if min is set but less than max data value (non stacked)', () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: { min: '10' }
                };

                expect(shouldStartOrEndOnTick(chartOptions)).toBeFalsy();
            });

            it('should return true if min is set and bigger than max data value (non stacked)', () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: { min: '22' }
                };

                expect(shouldStartOrEndOnTick(chartOptions)).toBeTruthy();
            });

            it('should return true when no max or min are set', () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: {}
                };

                expect(shouldStartOrEndOnTick(chartOptions)).toBeTruthy();
            });

            it('should return true if max is set but less than min data value (non stacked)', () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: { max: '-10' }
                };

                expect(shouldStartOrEndOnTick(chartOptions)).toBeTruthy();
            });
        });

        describe('Stacked chart', () => {
            it('should return false if min is set but less than max data value (stacked)', () => {
                const chartOptions = {
                    ...stackedChartOptions,
                    yAxisProps: { min: '10' }
                };

                expect(shouldStartOrEndOnTick(chartOptions)).toBeFalsy();
            });

            it('should return true if min is set but serie is not visible (stacked)', () => {
                const chartOptions = {
                    ...stackedChartOptions,
                    data: {
                        series: [
                            { ...stackedChartOptions.data.series[0], visible: false }
                        ]
                    },
                    yAxisProps: { min: '10' }
                };

                expect(shouldStartOrEndOnTick(chartOptions)).toBeTruthy();
            });

            it('should return true if min is set and greater than max data value (stacked)', () => {
                const chartOptions = {
                    ...stackedChartOptions,
                    yAxisProps: { min: '22' }
                };

                expect(shouldStartOrEndOnTick(chartOptions)).toBeTruthy();
            });

            it('should return true if max is set but less than min data value (stacked)', () => {
                const chartOptions = {
                    ...stackedChartOptions,
                    yAxisProps: { max: '-10' }
                };

                expect(shouldStartOrEndOnTick(chartOptions)).toBeTruthy();
            });
        });
    });

    describe('shouldFollowPointer', () => {
        const nonStackedChartOptions = {
            type: VisualizationTypes.COLUMN,
            yAxes: [{ title: 'atitle' }],
            xAxes: [{ title: 'xtitle' }],
            data: {
                series: [
                    {
                        color: 'rgb(0, 0, 0)',
                        name: '<b>aaa</b>',
                        data: [
                            {
                                name: 'data1',
                                y: 50
                            },
                            {
                                name: 'data2',
                                y: 150
                            },
                            {
                                name: 'data3',
                                y: -12
                            }
                        ],
                        visible: true
                    }
                ]
            }
        };

        const stackedChartOptions = {
            type: VisualizationTypes.COLUMN,
            hasStackByAttribute: true,
            yAxes: [{ title: 'atitle' }],
            xAxes: [{ title: 'xtitle' }],
            data: {
                series: [
                    {
                        color: 'rgb(0, 0, 0)',
                        name: '<b>aaa</b>',
                        data: [
                            {
                                name: 'data1',
                                y: 25
                            },
                            {
                                name: 'data2',
                                y: 75
                            },
                            {
                                name: 'data3',
                                y: -12
                            }
                        ],
                        visible: true
                    }, {
                        color: 'rgb(0, 0, 0)',
                        name: '<b>bbb</b>',
                        data: [
                            {
                                name: 'data1',
                                y: 25
                            },
                            {
                                name: 'data2',
                                y: 75
                            },
                            {
                                name: 'data3',
                                y: -12
                            }
                        ],
                        visible: true
                    }
                ]
            }
        };

        describe('Non stacked chart', () => {
            it('should return false when no extremes are defined', () => {
                const result = shouldFollowPointer({
                    ...nonStackedChartOptions,
                    xAxisProps: {},
                    yAxisProps: {}
                });

                expect(result).toBeFalsy();
            });

            it('should return false when data values are in axis range', () => {
                const result = shouldFollowPointer({
                    ...nonStackedChartOptions,
                    yAxisProps: {
                        min: '-30',
                        max: '200'
                    }
                });

                expect(result).toBeFalsy();
            });

            it('should return true when min is in negative value', () => {
                const result = shouldFollowPointer({
                    ...nonStackedChartOptions,
                    yAxisProps: {
                        min: '-10'
                    }
                });

                expect(result).toBeTruthy();
            });

            it('should return true when min and max are within data values', () => {
                const result = shouldFollowPointer({
                    ...nonStackedChartOptions,
                    yAxisProps: {
                        min: '60',
                        max: '100'
                    }
                });

                expect(result).toBeTruthy();
            });

            it('should return true when min is bigger than minimal value', () => {
                const result = shouldFollowPointer({
                    ...nonStackedChartOptions,
                    yAxisProps: {
                        min: '0'
                    }
                });

                expect(result).toBeTruthy();
            });
        });

        describe('Stacked chart', () => {
            it('should return false when no extremes are defined', () => {
                const result = shouldFollowPointer({
                    ...stackedChartOptions,
                    xAxisProps: {},
                    yAxisProps: {}
                });

                expect(result).toBeFalsy();
            });

            it('should return false when data values are in axis range', () => {
                const result = shouldFollowPointer({
                    ...stackedChartOptions,
                    yAxisProps: {
                        min: '-30',
                        max: '200'
                    }
                });

                expect(result).toBeFalsy();
            });

            it('should return true when min and max are within data values', () => {
                const result = shouldFollowPointer({
                    ...stackedChartOptions,
                    yAxisProps: {
                        min: '60',
                        max: '100'
                    }
                });

                expect(result).toBeTruthy();
            });

            it('should return true when min is bigger than minimal value', () => {
                const result = shouldFollowPointer({
                    ...stackedChartOptions,
                    yAxisProps: {
                        min: '0'
                    }
                });

                expect(result).toBeTruthy();
            });
        });
    });

    describe('pointInRange', () => {
        it('should return true when data point is in the axis range', () => {
            expect(pointInRange(5, {
                minAxisValue: 2,
                maxAxisValue: 8
            })).toBeTruthy();
        });

        it('should return true when data point is on the left edge of axis range', () => {
            expect(pointInRange(5, {
                minAxisValue: 5,
                maxAxisValue: 8
            })).toBeTruthy();
        });

        it('should return true when data point is on the right edge of axis range', () => {
            expect(pointInRange(5, {
                minAxisValue: 2,
                maxAxisValue: 5
            })).toBeTruthy();
        });

        it('should return false when data point is outside of axis range', () => {
            expect(pointInRange(5, {
                minAxisValue: -5,
                maxAxisValue: 2
            })).toBeFalsy();
        });
    });
    describe('getStackedExtremeValues', () => {

        const seriesNegativeAndPositiveValues = [
            {
                color: 'rgb(0, 0, 0)',
                name: '<b>aaa</b>',
                data: [
                    {
                        name: 'data1',
                        y: 25
                    },
                    {
                        name: 'data2',
                        y: 75
                    },
                    {
                        name: 'data3',
                        y: 30
                    }
                ],
                visible: true
            }, {
                color: 'rgb(0, 0, 0)',
                name: '<b>bbb</b>',
                data: [
                    {
                        name: 'data1',
                        y: -25
                    },
                    {
                        name: 'data2',
                        y: -75
                    },
                    {
                        name: 'data3',
                        y: -30
                    }
                ],
                visible: true
            },
            {
                color: 'rgb(0, 0, 0)',
                name: '<b>bbb</b>',
                data: [
                    {
                        name: 'data1',
                        y: 15
                    },
                    {
                        name: 'data2',
                        y: 60
                    },
                    {
                        name: 'data3',
                        y: 20
                    }
                ],
                visible: true
            },
            {
                color: 'rgb(0, 0, 0)',
                name: '<b>bbb</b>',
                data: [
                    {
                        name: 'data1',
                        y: -15
                    },
                    {
                        name: 'data2',
                        y: -60
                    },
                    {
                        name: 'data3',
                        y: -20
                    }
                ],
                visible: true
            }
        ];

        const negativeValues = [
                       {
                color: 'rgb(0, 0, 0)',
                name: '<b>bbb</b>',
                data: [
                    {
                        name: 'data1',
                        y: -25
                    },
                    {
                        name: 'data2',
                        y: -75
                    },
                    {
                        name: 'data3',
                        y: -30
                    }
                ],
                visible: true
            },
            {
                color: 'rgb(0, 0, 0)',
                name: '<b>bbb</b>',
                data: [
                    {
                        name: 'data1',
                        y: -15
                    },
                    {
                        name: 'data2',
                        y: -60
                    },
                    {
                        name: 'data3',
                        y: -20
                    }
                ],
                visible: true
            }
        ];

        describe('getStackedMaxValue', () => {
            it('should match output for negative and positive values', () => {
                const result = getStackedMaxValue(seriesNegativeAndPositiveValues);
                expect(result).toEqual(135);
            });

            it('should match output for negative values', () => {
                const result = getStackedMaxValue(negativeValues);
                expect(result).toEqual(-15);
            });
        });

        describe('getStackedMinValue', () => {

            it('should match output for negative and positive values', () => {
                const result = getStackedMinValue(seriesNegativeAndPositiveValues);
                expect(result).toEqual(-135);
            });

            it('should match output for negative values', () => {
                const result = getStackedMinValue(negativeValues);
                expect(result).toEqual(-135);
            });
        });
    });
});
