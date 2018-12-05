// (C) 2007-2018 GoodData Corporation
import head = require('lodash/head');
import last = require('lodash/last');
import { IMinMaxInfo, getMinMax, createTickPositions } from '../zeroAlignYAxis';

describe('get tick positions for dual axes chart', () => {

    describe('test generate min/max values', () => {
        interface IMinMax {
            min: number;
            max: number;
        }

        const minmaxTemplate: IMinMaxInfo[] = [{
            // first axis
            id: 0,
            isSetMin: false,
            isSetMax: false
        }, {
            // second axis
            id: 1,
            isSetMin: false,
            isSetMax: false
        }];

        const createMinMax = (left: IMinMax, right: IMinMax): IMinMaxInfo[] => {
            return [
                { ...minmaxTemplate[0], ...left },
                { ...minmaxTemplate[1], ...right }
            ];
        };

        const assertMinMax = (expected: IMinMax, actual: IMinMax) => {
            expect(actual.min).toEqual(expected.min);
            expect(actual.max).toEqual(expected.max);
        };

        const compareMinMax = (actual: IMinMax[], expected: IMinMax[]) => {
            const minmax = createMinMax(actual[0], actual[1]);
            expected.forEach((item: IMinMax, axisIndex: number) =>
                assertMinMax(item, getMinMax(axisIndex, minmax[axisIndex].min, minmax[axisIndex].max, minmax))
            );
        };

        describe('dataset with 0+ data on both axes', () => {
            it('start from zero on both axes', () => {
                const actual = [{
                    min: 0, max: 100
                }, {
                    min: 0, max: 10000
                }];
                const expected = [...actual];
                compareMinMax(actual, expected);
            });

            it('not start from zero on both axes', () => {
                const actual = [{
                    min: 50, max: 100
                }, {
                    min: 5000, max: 10000
                }];
                const expected = [...actual];
                compareMinMax(actual, expected);
            });

            it('start from zero on left axis', () => {
                const actual = [{
                    min: 0, max: 100
                }, {
                    min: 1000, max: 10000
                }];
                const expected = [...actual];
                compareMinMax(actual, expected);
            });

            it('start from zero on right axis', () => {
                const actual = [{
                    min: 50, max: 100
                }, {
                    min: 0, max: 10000
                }];
                const expected = [...actual];
                compareMinMax(actual, expected);
            });
        });

        describe('dataset with 0- data on both axes', () => {
            it('start from zero on both axes', () => {
                const actual = [{
                    min: -100, max: 0
                }, {
                    min: -10000, max: 0
                }];
                const expected = [...actual];
                compareMinMax(actual, expected);
            });

            it('not start from zero on both axes', () => {
                const actual = [{
                    min: -100, max: -50
                }, {
                    min: -10000, max: -5000
                }];
                const expected = [...actual];
                compareMinMax(actual, expected);
            });

            it('start from zero on left axis', () => {
                const actual = [{
                    min: -100, max: 0
                }, {
                    min: -10000, max: -5000
                }];
                const expected = [...actual];
                compareMinMax(actual, expected);
            });

            it('start from zero on right axis', () => {
                const actual = [{
                    min: -100, max: -50
                }, {
                    min: -10000, max: 0
                }];
                const expected = [...actual];
                compareMinMax(actual, expected);
            });
        });

        describe('dataset with +0 data on left axis and 0- data on right axis', () => {
            it('start from zero on both axes', () => {
                const actual = [{
                    min: 0, max: 100
                }, {
                    min: -10000, max: 0
                }];
                const expected = [{
                    min: -100, max: 100
                }, {
                    min: -10000, max: 10000
                }];
                compareMinMax(actual, expected);
            });

            it('not start from zero on both axes', () => {
                const actual = [{
                    min: 50, max: 100
                }, {
                    min: -10000, max: -5000
                }];
                const expected = [{
                    min: -100, max: 100
                }, {
                    min: -10000, max: 10000
                }];
                compareMinMax(actual, expected);
            });

            it('start from zero on left axis', () => {
                const actual = [{
                    min: 0, max: 100
                }, {
                    min: -10000, max: -5000
                }];
                const expected = [{
                    min: -100, max: 100
                }, {
                    min: -10000, max: 10000
                }];
                compareMinMax(actual, expected);
            });

            it('start from zero on right axis', () => {
                const actual = [{
                    min: 50, max: 100
                }, {
                    min: -10000, max: 0
                }];
                const expected = [{
                    min: -100, max: 100
                }, {
                    min: -10000, max: 10000
                }];
                compareMinMax(actual, expected);
            });
        });

        describe('dataset with +0 data and 0- data on both axes', () => {
            it('two axes have same scale', () => {
                const actual = [{
                    min: -100, max: 100
                }, {
                    min: -10000, max: 10000
                }];
                const expected = [...actual];
                compareMinMax(actual, expected);
            });

            it('two axes not have same scale', () => {
                const actual = [{
                    min: -100, max: 10000
                }, {
                    min: -10000000, max: -10000
                }];
                const expected = [{
                    min: -100, max: 10000
                }, {
                    min: -10000000, max: 1000000000
                }];
                compareMinMax(actual, expected);
            });

            it('left min and max right are calculated relatively on both axes', () => {
                const actual = [{
                    min: 100, max: 10000
                }, {
                    min: -10000000, max: -10000
                }];
                const expected = [{
                    min: -10000, max: 10000
                }, {
                    min: -10000000, max: 10000000
                }];
                compareMinMax(actual, expected);
            });

            it('left min is calculated relatively on both axes', () => {
                const actual = [{
                    min: 0, max: 100
                }, {
                    min: -10000, max: 10000
                }];
                const expected = [{
                    min: -100, max: 100
                }, {
                    min: -10000, max: 10000
                }];
                compareMinMax(actual, expected);
            });

            it('left min is calculated relatively on both axes - other case', () => {
                const actual = [{
                    min: -1000, max: 1000
                }, {
                    min: -100000, max: 10
                }];
                const expected = [{
                    min: -10000000, max: 1000
                }, {
                    min: -100000, max: 10
                }];
                compareMinMax(actual, expected);
            });
        });
    });

    describe('test generate tick positions', () => {

        const TICK_AMOUNT = 10;

        const minmaxAuto = [{
            id: 0,
            isSetMin: false,
            isSetMax: false
        }, {
            id: 1,
            isSetMin: false,
            isSetMax: false
        }];

        const minmaxConfigOnLeftAxis = [{
            id: 0,
            isSetMin: true,
            isSetMax: false
        }, {
            id: 1,
            isSetMin: false,
            isSetMax: false
        }];

        const minmaxConfigOnBothAxes = [{
            id: 0,
            isSetMin: true,
            isSetMax: false
        }, {
            id: 1,
            isSetMin: false,
            isSetMax: true
        }];

        const runTest = (min: number, max: number, expectedMin: number, expectedMax: number,
                         expectedTickNumber: number, minmax: IMinMaxInfo[]) => {
            const actual = createTickPositions(min, max, minmax, TICK_AMOUNT);
            expect(actual.length).toEqual(expectedTickNumber);
            expect(Math.floor(head(actual))).toEqual(expectedMin);
            expect(Math.floor(last(actual))).toEqual(expectedMax);
        };

        it('start from 0+', () => {
            runTest(0, 100, 0, 100, TICK_AMOUNT, minmaxAuto);
        });

        it('not start from 0+', () => {
            runTest(50, 150, 50, 150, TICK_AMOUNT, minmaxAuto);
        });

        it('start from -0', () => {
            runTest(-100, 0, -100, 0, TICK_AMOUNT, minmaxAuto);
        });

        it('not start from -0', () => {
            runTest(-150, -50, -150, -50, TICK_AMOUNT, minmaxAuto);
        });

        it('start from -0 to 0+ without min/max config', () => {
            runTest(-500, 500, -556, 555, TICK_AMOUNT + 1, minmaxAuto);
        });

        it('start from -0 to 0+ with min/max config on both axes', () => {
            runTest(-500, 500, -500, 500, TICK_AMOUNT, minmaxConfigOnBothAxes);
        });

        it('start from -0 to 0+ with min/max config on left axis', () => {
            runTest(-500, 500, -556, 555, TICK_AMOUNT + 1, minmaxConfigOnLeftAxis);
        });

        it('sync grid lines between axes with 0+ data', () => {
            const firstAxisTicks = createTickPositions(0, 10000, minmaxAuto, TICK_AMOUNT);
            const secondAxisTicks = createTickPositions(0, 500, minmaxAuto, TICK_AMOUNT);
            expect(firstAxisTicks.length).toEqual(secondAxisTicks.length);
        });

        it('sync grid lines between axes with 0- data', () => {
            const firstAxisTicks = createTickPositions(-10000, 0, minmaxAuto, TICK_AMOUNT);
            const secondAxisTicks = createTickPositions(-500, 0, minmaxAuto, TICK_AMOUNT);
            expect(firstAxisTicks.length).toEqual(secondAxisTicks.length);
        });

        it('sync grid lines between axes with -0 and 0+ data - only lef axis configured', () => {
            const firstAxisTicks = createTickPositions(-10000, 10000, minmaxConfigOnLeftAxis, TICK_AMOUNT);
            const secondAxisTicks = createTickPositions(-500, 500, minmaxConfigOnLeftAxis, TICK_AMOUNT);
            expect(firstAxisTicks.length).toEqual(secondAxisTicks.length);
        });

        it('sync grid lines between axes with -0 and 0+ data - both axes configured', () => {
            const firstAxisTicks = createTickPositions(-10000, 10000, minmaxConfigOnBothAxes, TICK_AMOUNT);
            const secondAxisTicks = createTickPositions(-500, 500, minmaxConfigOnBothAxes, TICK_AMOUNT);
            expect(firstAxisTicks.length).toEqual(secondAxisTicks.length);
        });
    });
});
