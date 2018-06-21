// (C) 2007-2018 GoodData Corporation
import {
    shouldFollowPointer,
    showDataLabelInAxisRange,
    shouldStartOrEndOnTick,
    getDataLabelAttributes
} from '../helpers';
import { VisualizationTypes } from '../../../../../constants/visualizationTypes';

describe('helpers', () => {
    describe('getDataLabelAttributes', () => {
        const hiddenAttributes = {
            x: 0,
            y: 0,
            height: 0,
            width: 0
        };

        it('should position data label when in range', () => {
            const result = getDataLabelAttributes({
                dataLabel: {
                    parentGroup: {
                        translateX: 0,
                        translateY: 0
                    },
                    x: 1,
                    y: 1,
                    width: 100,
                    height: 100
                }
            });

            expect(result).toEqual({
                x: 1,
                y: 1,
                width: 100,
                height: 100
            });
        });

        it('should hide data label when outside range', () => {
            const result = getDataLabelAttributes({
                dataLabel: {
                    parentGroup: {
                        translateX: 0,
                        translateY: 0
                    },
                    x: -200,
                    y: -200,
                    width: 100,
                    height: 100
                }
            });

            expect(result).toEqual(hiddenAttributes);
        });

        it('should hide label when label not present on point', () => {
            const result = getDataLabelAttributes({
                dataLabel: null
            });

            expect(result).toEqual(hiddenAttributes);
        });

        it('should hide label when label present but parentgroup missing', () => {
            const result = getDataLabelAttributes({
                dataLabel: {
                    parentGroup: null
                }
            });

            expect(result).toEqual(hiddenAttributes);
        });
    });

    describe('shouldStartOrEndOnTick', () => {
        it('should return true when no max or min are set', () => {
            expect(shouldStartOrEndOnTick(null, null)).toBeTruthy();
        });

        it('should return false when min or max are set', () => {
            expect(shouldStartOrEndOnTick('20', '5')).toBeFalsy();
        });

        it('should return true when min is greater than max', () => {
            expect(shouldStartOrEndOnTick('20', '30')).toBeTruthy();
        });
    });

    describe('showDataLabelInAxisRange', () => {
        let point: any;
        beforeEach(() => {
            point = {
                dataLabel: {
                    show: jest.fn(),
                    hide: jest.fn()
                },
                y: 100
            };
        });

        it('should hide data label when below minimum', () => {
            showDataLabelInAxisRange(point, 200);
            expect(point.dataLabel.hide).toHaveBeenCalled();
            expect(point.dataLabel.show).not.toHaveBeenCalled();
        });

        it('should show data label when in range', () => {
            showDataLabelInAxisRange(point, 0);
            expect(point.dataLabel.show).toHaveBeenCalled();
            expect(point.dataLabel.hide).not.toHaveBeenCalled();
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
                            }
                        ]
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
                            }
                        ]
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
                            }
                        ]
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
                        min: 30,
                        max: 200
                    }
                });

                expect(result).toBeFalsy();
            });

            it('should return true when min and max are within data values', () => {
                const result = shouldFollowPointer({
                    ...nonStackedChartOptions,
                    yAxisProps: {
                        min: 60,
                        max: 100
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
                        min: 30,
                        max: 200
                    }
                });

                expect(result).toBeFalsy();
            });

            it('should return true when min and max are within data values', () => {
                const result = shouldFollowPointer({
                    ...stackedChartOptions,
                    yAxisProps: {
                        min: 60,
                        max: 100
                    }
                });

                expect(result).toBeTruthy();
            });
        });
    });
});
