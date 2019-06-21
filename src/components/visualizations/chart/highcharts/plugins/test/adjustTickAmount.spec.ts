// (C) 2019 GoodData Corporation
import {
    adjustTicks,
    alignSecondaryAxis,
    customAdjustTickAmount,
    preventDataCutOff,
    shouldBeHandledByHighcharts,
} from "../adjustTickAmount";
import { IHighchartsAxisExtend } from "../../../../../../interfaces/HighchartsExtend";
import { VisualizationTypes } from "../../../../../../constants/visualizationTypes";

describe("adjustTickAmount - general", () => {
    const Y_AXIS = {
        hasData: () => true,
        coll: "yAxis",
        options: {
            startOnTick: true,
            endOnTick: true,
        },
    };

    it("should not adjust tick on no-data axis", () => {
        const axis: IHighchartsAxisExtend = {
            hasData: () => false,
        };
        const result = customAdjustTickAmount.call(axis);
        expect(result).toBeFalsy();
    });

    describe("should adjust tick amount without user-input min/max", () => {
        const chart: any = {
            axes: [],
            userOptions: {
                yAxis: [{ isUserMinMax: false }, { isUserMinMax: false }],
            },
        };
        // min/max are calculated in 'getZeroAlignConfiguration'
        const leftAxis = {
            ...Y_AXIS,
            chart,
            tickAmount: 8,
            tickInterval: 300,
            tickPositions: [-1200, -900, -600, -300, 0, 300, 600, 900, 1200], // 9 ticks
            opposite: false,
            dataMin: 137,
            dataMax: 986,
            min: -986,
            max: 986,
        };
        const rightAxis = {
            ...Y_AXIS,
            chart,
            tickAmount: 8,
            tickInterval: 3000,
            tickPositions: [-12000, -9000, -6000, -3000, 0, 3000, 6000, 9000, 12000], // 9 ticks
            opposite: true,
            dataMin: -8895,
            dataMax: -1239,
            min: -8895,
            max: 8895,
        };

        beforeAll(() => {
            chart.axes = [leftAxis, rightAxis];
            customAdjustTickAmount.call(leftAxis);
            customAdjustTickAmount.call(rightAxis);
        });

        it.each([
            ["left", leftAxis, [-900, -600, -300, 0, 300, 600, 900, 1200]], // reduced to 8 ticks
            ["right", rightAxis, [-9000, -6000, -3000, 0, 3000, 6000, 9000, 12000]], // reduced to 8 ticks
        ])(
            "should return %s tick positions aligned zero with opposite",
            (_side: string, axis: IHighchartsAxisExtend, expectation: number) => {
                expect(axis.tickPositions).toEqual(expectation);
            },
        );

        it.each([["left", leftAxis, -900, 1200], ["right", rightAxis, -9000, 12000]])(
            "should min/max be updated on %s axis",
            (_side: string, axis: IHighchartsAxisExtend, min: number, max: number) => {
                expect(axis.min).toBe(min);
                expect(axis.max).toBe(max);
            },
        );

        it("should two axes be zero aligned", () => {
            expect(leftAxis.tickPositions.indexOf(0)).toBe(rightAxis.tickPositions.indexOf(0));
        });
    });

    describe("should adjust tick amount with user-input min/max", () => {
        const chart: any = {
            axes: [],
            userOptions: {
                yAxis: [{ isUserMinMax: true }, { isUserMinMax: true }],
            },
        };

        const leftAxis = {
            ...Y_AXIS,
            chart,
            tickAmount: 8,
            tickInterval: 15,
            tickPositions: [-90, -75, -60, -45, -30, -15, 0], // 7 ticks
            opposite: false,
            dataMin: -656,
            dataMax: 986,
            min: -100,
            max: 0,
        };
        const rightAxis = {
            ...Y_AXIS,
            chart,
            tickAmount: 8,
            tickInterval: 800,
            tickPositions: [-4800, -4000, -3200, -2400, -1600, -800, 0], // 7 ticks
            opposite: true,
            dataMin: -8895,
            dataMax: 7661,
            min: 0,
            max: -4500,
        };

        beforeAll(() => {
            chart.axes = [leftAxis, rightAxis];
            customAdjustTickAmount.call(leftAxis);
            customAdjustTickAmount.call(rightAxis);
        });

        it.each([
            ["left", leftAxis, [-105, -90, -75, -60, -45, -30, -15, 0]], // adjusted to 8 ticks
            ["right", rightAxis, [-5600, -4800, -4000, -3200, -2400, -1600, -800, 0]], // adjusted to 8 ticks
        ])(
            "should return %s tick positions aligned zero with opposite",
            (_side: string, axis: IHighchartsAxisExtend, expectation: number) => {
                expect(axis.tickPositions).toEqual(expectation);
            },
        );

        it.each([["left", leftAxis, -105, 0], ["right", rightAxis, -5600, 0]])(
            "should min/max be updated on %s axis",
            (_side: string, axis: IHighchartsAxisExtend, min: number, max: number) => {
                expect(axis.min).toBe(min);
                expect(axis.max).toBe(max);
            },
        );

        it("should two axes be zero aligned", () => {
            expect(leftAxis.tickPositions.indexOf(0)).toBe(rightAxis.tickPositions.indexOf(0));
        });
    });
});

describe("adjustTickAmount - detail", () => {
    describe("adjustTicks", () => {
        it("should not adjust any tick", () => {
            const axis: IHighchartsAxisExtend = {
                tickAmount: 1,
                tickPositions: [100],
            };
            expect(adjustTicks(axis)).toBeFalsy();
        });

        it("should add tick with negative data", () => {
            const axis: IHighchartsAxisExtend = {
                tickInterval: 10,
                tickAmount: 3,
                tickPositions: [-20, -10],
                dataMin: -20,
                dataMax: -10,
            };
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([-30, -20, -10]);
        });

        it("should add tick with negative data and positive min/max", () => {
            // tick should be added with direction from data set
            const axis: IHighchartsAxisExtend = {
                tickInterval: 5,
                tickAmount: 3,
                tickPositions: [10, 15],
                min: 5,
                max: 15,
                dataMin: -20,
                dataMax: -10,
            };
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([5, 10, 15]);
        });

        it("should add tick with positive data", () => {
            const axis: IHighchartsAxisExtend = {
                tickInterval: 10,
                tickAmount: 3,
                tickPositions: [10, 20],
                dataMin: 10,
                dataMax: 20,
            };
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([10, 20, 30]);
        });

        it("should add tick to first with negative-to-positive data and negative min/max", () => {
            // tick should be added with direction from data set
            const axis: IHighchartsAxisExtend = {
                tickInterval: 5,
                tickAmount: 3,
                tickPositions: [-15, -10],
                min: -20,
                max: -10,
                dataMin: -10,
                dataMax: 20,
            };
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([-20, -15, -10]);
        });

        it("should add tick to end with negative-to-positive data and positive min/max", () => {
            // tick should be added with direction from data set
            const axis: IHighchartsAxisExtend = {
                tickInterval: 5,
                tickAmount: 3,
                tickPositions: [-15, -10],
                min: 20,
                max: 10,
                dataMin: -10,
                dataMax: 20,
            };
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([-15, -10, -5]);
        });

        it("should add tick to last where min starts from 0", () => {
            const axis: IHighchartsAxisExtend = {
                tickInterval: 50,
                tickAmount: 4,
                tickPositions: [0, 50, 100],
                dataMin: -50,
                dataMax: 200,
                min: 0,
            };
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([0, 50, 100, 150]);
        });

        it("should add tick to first by default", () => {
            const axis: IHighchartsAxisExtend = {
                tickInterval: 100,
                tickAmount: 3,
                tickPositions: [-50, 50],
            };
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([-150, -50, 50]);
        });

        it("should reduce tick at the start", () => {
            const axis: IHighchartsAxisExtend = {
                tickInterval: 100,
                tickAmount: 3,
                tickPositions: [0, 100, 200, 300, 400],
                dataMin: 50,
                dataMax: 350,
            };
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([200, 300, 400]);
        });

        it("should reduce tick at the end", () => {
            const axis: IHighchartsAxisExtend = {
                tickInterval: 100,
                tickAmount: 3,
                tickPositions: [-400, -300, -200, -100, 0],
                dataMin: -350,
                dataMax: -50,
            };
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([-400, -300, -200]);
        });
    });

    describe("alignSecondaryAxis", () => {
        it("should not handle primary axis", () => {
            const leftAxis: IHighchartsAxisExtend = {
                opposite: false,
            };
            expect(alignSecondaryAxis(leftAxis)).toBeFalsy();
        });

        it("should not handle chart without primary axis", () => {
            const rightAxis: IHighchartsAxisExtend = {
                opposite: true,
                chart: {
                    axes: [{}],
                },
            };
            expect(alignSecondaryAxis(rightAxis)).toBeFalsy();
        });

        it("should do nothing with aligned axes", () => {
            const leftAxis: IHighchartsAxisExtend = {
                opposite: false,
                tickPositions: [-1, -2, 0, 1, 2, 3],
            };
            const rightAxis: IHighchartsAxisExtend = {
                opposite: true,
                tickPositions: [-200, -100, 0, 100, 200, 300],
                chart: {
                    axes: [leftAxis],
                },
            };
            alignSecondaryAxis(rightAxis);
            expect(rightAxis.tickPositions).toEqual([-200, -100, 0, 100, 200, 300]);
        });

        it("should zero move right", () => {
            const leftAxis: IHighchartsAxisExtend = {
                coll: "yAxis",
                opposite: false,
                tickPositions: [-1, -2, 0, 1, 2, 3],
            };
            const rightAxis: IHighchartsAxisExtend = {
                coll: "yAxis",
                opposite: true,
                tickInterval: 100,
                tickPositions: [0, 100, 200, 300, 400, 500],
                chart: {
                    axes: [leftAxis],
                },
            };
            alignSecondaryAxis(rightAxis);
            expect(rightAxis.tickPositions).toEqual([-200, -100, 0, 100, 200, 300]);
        });

        it("should zero move left", () => {
            const leftAxis = {
                coll: "yAxis",
                opposite: false,
                tickPositions: [-1, -2, 0, 1, 2, 3],
            };
            const rightAxis = {
                coll: "yAxis",
                opposite: true,
                tickInterval: 100,
                tickPositions: [-400, -300, -200, -100, 0, 100],
                chart: {
                    axes: [leftAxis],
                },
            };
            alignSecondaryAxis(rightAxis);
            expect(rightAxis.tickPositions).toEqual([-200, -100, 0, 100, 200, 300]);
        });
    });

    describe("preventDataCutOff", () => {
        it("should not run with chart having user-input min/max", () => {
            const rightAxis = {
                opposite: true,
                chart: {
                    userOptions: {
                        yAxis: [{ isUserMinMax: true }, { isUserMinMax: true }],
                    },
                },
                setTickPositions: jest.fn(),
            };
            expect(preventDataCutOff(rightAxis)).toBeFalsy();
            expect(rightAxis.setTickPositions).not.toHaveBeenCalled();
        });

        it("should not run with non-cut-off chart", () => {
            const rightAxis = {
                opposite: true,
                chart: {
                    userOptions: {
                        yAxis: [{ isUserMinMax: false }, { isUserMinMax: false }],
                    },
                },
                setTickPositions: jest.fn(),
                min: 0,
                max: 100,
                dataMin: 10,
                dataMax: 90,
            };
            expect(preventDataCutOff(rightAxis)).toBeFalsy();
            expect(rightAxis.setTickPositions).not.toHaveBeenCalled();
        });

        it("should double tick interval to zoom out secondary axis", () => {
            const rightAxis = {
                opposite: true,
                chart: {
                    userOptions: {
                        yAxis: [{ isUserMinMax: false }, { isUserMinMax: false }],
                    },
                },
                setTickPositions: jest.fn(),
                min: 20,
                max: 80,
                dataMin: 10,
                dataMax: 90,
                tickInterval: 10,
            };
            preventDataCutOff(rightAxis);
            expect(rightAxis.setTickPositions).toHaveBeenCalledTimes(1);
            expect(rightAxis.tickInterval).toBe(20);
        });
    });

    describe("shouldBeHandledByHighcharts", () => {
        it("should let Highcharts handle X axis", () => {
            const xAxis = {
                coll: "xAxis",
            };
            expect(shouldBeHandledByHighcharts(xAxis)).toBeTruthy();
        });

        it("should let Highcharts handle single Y", () => {
            const yAxis = {
                coll: "yAxis",
                chart: {
                    axes: [
                        {
                            coll: "yAxis",
                        },
                    ],
                },
            };
            expect(shouldBeHandledByHighcharts(yAxis)).toBeTruthy();
        });

        it("should let Highcharts handle line chart", () => {
            const yAxis: Partial<IHighchartsAxisExtend> = {
                coll: "yAxis",
                series: [],
                chart: {
                    axes: [
                        {
                            coll: "yAxis",
                        },
                        {
                            coll: "yAxis",
                        },
                    ],
                    userOptions: {
                        chart: {
                            type: VisualizationTypes.LINE,
                        },
                    },
                },
            };
            expect(shouldBeHandledByHighcharts(yAxis)).toBeTruthy();
        });

        it("should let Highcharts handle combo line-line chart", () => {
            const yAxis = {
                coll: "yAxis",
                series: [
                    {
                        type: VisualizationTypes.LINE,
                    },
                ],
                chart: {
                    axes: [
                        {
                            coll: "yAxis",
                        },
                        {
                            coll: "yAxis",
                        },
                    ],
                },
            };
            // use cast here because mock object does not have enough required props
            expect(shouldBeHandledByHighcharts(yAxis as Partial<IHighchartsAxisExtend>)).toBeTruthy();
        });

        it("should let Highcharts handle if any Y axis is disable", () => {
            const yAxis: Partial<IHighchartsAxisExtend> = {
                coll: "yAxis",
                series: [],
                chart: {
                    axes: [
                        {
                            coll: "yAxis",
                            visible: false,
                        },
                        {
                            coll: "yAxis",
                        },
                    ],
                },
            };
            expect(shouldBeHandledByHighcharts(yAxis)).toBeTruthy();
        });
    });
});
