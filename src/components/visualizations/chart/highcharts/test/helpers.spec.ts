// (C) 2007-2018 GoodData Corporation
import { shouldFollowPointer, shouldStartOrEndOnTick } from '../helpers';
import { VisualizationTypes } from '../../../../../constants/visualizationTypes';

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
