// (C) 2019-2020 GoodData Corporation
import {
    adjustTicks,
    ALIGNED,
    alignToBaseAxis,
    customAdjustTickAmount,
    getDirection,
    getSelectionRange,
    getYAxisScore,
    MOVE_ZERO_LEFT,
    MOVE_ZERO_RIGHT,
    preventDataCutOff,
    shouldBeHandledByHighcharts,
    Y_AXIS_SCORE,
} from "../adjustTickAmount.js";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { UnsafeInternals } from "../../../typings/unsafe.js";
import Highcharts from "../../../lib/index.js";
import { IHighchartsAxisExtend } from "../../../typings/extend.js";
import { describe, it, expect, beforeAll } from "vitest";

const mockAxis = ({
    tickInterval,
    tickAmount,
    tickPositions,
    min,
    max,
    dataMin,
    dataMax,
    userMin = dataMin,
    userMax = dataMax,
    opposite,
    chart,
    coll,
    options,
    userOptions,
    hasData,
}: Partial<Highcharts.Axis | UnsafeInternals>): Highcharts.Axis | UnsafeInternals => ({
    tickInterval,
    tickAmount,
    tickPositions,
    opposite,
    chart,
    coll,
    options,
    userOptions,
    hasData,
    getExtremes: () => ({
        min,
        max,
        dataMin,
        dataMax,
        userMin,
        userMax,
    }),
});

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
        const getLeftAxis = () =>
            mockAxis({
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
            });
        const getRightAxis = () =>
            mockAxis({
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
            });

        it.each([
            ["left", getLeftAxis(), [-900, -600, -300, 0, 300, 600, 900, 1200]], // reduced to 8 ticks
            ["right", getRightAxis(), [-12000, -9000, -6000, -3000, 0, 3000, 6000, 9000]], // reduced to 8 ticks
        ])(
            "should return %s tick positions aligned zero with opposite",
            (_side: any, axis: any, expectation: any) => {
                customAdjustTickAmount.call(axis);
                expect(axis.tickPositions).toEqual(expectation);
            },
        );

        it.each([
            ["left", getLeftAxis(), -900, 1200],
            ["right", getRightAxis(), -12000, 9000],
        ])("should min/max be updated on %s axis", (_side: any, axis: any, min: number, max: number) => {
            customAdjustTickAmount.call(axis);
            expect(axis.min).toBe(min);
            expect(axis.max).toBe(max);
        });
    });

    describe("should adjust tick amount with user-input min/max", () => {
        const chart: any = {
            axes: [],
            userOptions: {
                yAxis: [{ isUserMinMax: true }, { isUserMinMax: true }],
            },
        };

        const leftAxis = mockAxis({
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
        });
        const rightAxis = mockAxis({
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
        });

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
            (_side: any, axis: any, expectation: any) => {
                expect(axis.tickPositions).toEqual(expectation);
            },
        );

        it.each([
            ["left", leftAxis, -105, 0],
            ["right", rightAxis, -5600, 0],
        ])("should min/max be updated on %s axis", (_side: any, axis: any, min: number, max: number) => {
            expect(axis.min).toBe(min);
            expect(axis.max).toBe(max);
        });

        it("should two axes be zero aligned", () => {
            expect(leftAxis.tickPositions.indexOf(0)).toBe(rightAxis.tickPositions.indexOf(0));
        });
    });
});

describe("adjustTickAmount - detail", () => {
    describe("adjustTicks", () => {
        it("should not adjust any tick", () => {
            const axis = mockAxis({
                tickAmount: 1,
                tickPositions: [100],
            });
            expect(adjustTicks(axis)).toBeFalsy();
        });

        it("should add tick with negative data", () => {
            const axis = mockAxis({
                tickInterval: 10,
                tickAmount: 3,
                tickPositions: [-20, -10],
                dataMin: -20,
                dataMax: -10,
            });
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([-30, -20, -10]);
        });

        it("should add tick with negative data and positive min/max", () => {
            // tick should be added with direction from data set
            const axis = mockAxis({
                tickInterval: 5,
                tickAmount: 3,
                tickPositions: [10, 15],
                min: 5,
                max: 15,
                dataMin: -20,
                dataMax: -10,
            });
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([5, 10, 15]);
        });

        it("should add tick with positive data", () => {
            const axis = mockAxis({
                tickInterval: 10,
                tickAmount: 3,
                tickPositions: [10, 20],
                dataMin: 10,
                dataMax: 20,
            });
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([10, 20, 30]);
        });

        it("should add tick to first with negative-to-positive data and negative min/max", () => {
            // tick should be added with direction from data set
            const axis = mockAxis({
                tickInterval: 5,
                tickAmount: 3,
                tickPositions: [-15, -10],
                min: -20,
                max: -10,
                dataMin: -10,
                dataMax: 20,
            });
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([-20, -15, -10]);
        });

        it("should add tick to end with negative-to-positive data and positive min/max", () => {
            // tick should be added with direction from data set
            const axis = mockAxis({
                tickInterval: 5,
                tickAmount: 3,
                tickPositions: [-15, -10],
                min: 20,
                max: 10,
                dataMin: -10,
                dataMax: 20,
            });
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([-15, -10, -5]);
        });

        it("should add tick to last where min starts from 0", () => {
            const axis = mockAxis({
                tickInterval: 50,
                tickAmount: 4,
                tickPositions: [0, 50, 100],
                dataMin: -50,
                dataMax: 200,
                min: 0,
            });
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([0, 50, 100, 150]);
        });

        it("should add tick to first by default", () => {
            const axis = mockAxis({
                tickInterval: 100,
                tickAmount: 3,
                tickPositions: [-50, 50],
            });
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([-150, -50, 50]);
        });

        it("should reduce tick at the start", () => {
            const axis = mockAxis({
                tickInterval: 100,
                tickAmount: 3,
                tickPositions: [0, 100, 200, 300, 400],
                dataMin: 50,
                dataMax: 350,
            });
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([200, 300, 400]);
        });

        it("should reduce tick at the end", () => {
            const axis = mockAxis({
                tickInterval: 100,
                tickAmount: 3,
                tickPositions: [-400, -300, -200, -100, 0],
                dataMin: -350,
                dataMax: -50,
            });
            adjustTicks(axis);
            expect(axis.tickPositions).toEqual([-400, -300, -200]);
        });
    });

    describe("alignToBaseAxis", () => {
        it("should not handle base axis", () => {
            const leftAxis = mockAxis({
                opposite: false,
                tickPositions: [-2, -1, 0, 1, 2, 3],
                chart: {},
            });
            const rightAxis = mockAxis({
                opposite: true,
                tickPositions: [-200, -100, 0, 100, 200, 300],
                chart: {},
            });
            expect(alignToBaseAxis(leftAxis, rightAxis)).toBeFalsy();
        });

        it("should do nothing with aligned axes", () => {
            const leftAxis = mockAxis({
                opposite: false,
                tickPositions: [-2, -1, 0, 1, 2, 3],
                chart: {},
            });
            const rightAxis = mockAxis({
                opposite: true,
                tickPositions: [-200, -100, 0, 100, 200, 300],
                chart: {},
            });
            alignToBaseAxis(leftAxis, rightAxis);

            expect(rightAxis.tickPositions).toEqual([-200, -100, 0, 100, 200, 300]);
        });

        it("should zero move right on right axis", () => {
            const leftAxis = mockAxis({
                coll: "yAxis",
                opposite: false,
                tickPositions: [-2, -1, 0, 1, 2, 3],
                chart: {},
            });
            const rightAxis = mockAxis({
                coll: "yAxis",
                opposite: true,
                tickInterval: 100,
                tickPositions: [0, 100, 200, 300, 400, 500],
                chart: {},
            });
            alignToBaseAxis(rightAxis, leftAxis);

            expect(rightAxis.tickPositions).toEqual([-200, -100, 0, 100, 200, 300]);
            expect(leftAxis.tickPositions).toEqual([-2, -1, 0, 1, 2, 3]);
        });

        it("should zero move left on right axis", () => {
            const leftAxis = mockAxis({
                coll: "yAxis",
                opposite: false,
                tickPositions: [-2, -1, 0, 1, 2, 3],
                chart: {},
            });
            const rightAxis = mockAxis({
                coll: "yAxis",
                opposite: true,
                tickInterval: 100,
                tickPositions: [-400, -300, -200, -100, 0, 100],
                chart: {},
            });
            alignToBaseAxis(rightAxis, leftAxis);

            expect(rightAxis.tickPositions).toEqual([-200, -100, 0, 100, 200, 300]);
            expect(leftAxis.tickPositions).toEqual([-2, -1, 0, 1, 2, 3]);
        });
    });

    describe("preventDataCutOff", () => {
        it("should not run with chart having user-input min/max", () => {
            const axis = mockAxis({
                opposite: true,
                chart: {
                    userOptions: {
                        yAxis: [{ isUserMinMax: true }, { isUserMinMax: true }],
                    },
                },
            });
            expect(preventDataCutOff(axis)).toBeFalsy();
        });

        it("should not run with non-cut-off chart", () => {
            const axis = mockAxis({
                opposite: true,
                chart: {
                    userOptions: {
                        yAxis: [{ isUserMinMax: false }, { isUserMinMax: false }],
                    },
                },
                min: 0,
                max: 100,
                dataMin: 10,
                dataMax: 90,
            });
            expect(preventDataCutOff(axis)).toBeFalsy();
        });

        it("should double tick interval and tick positions to zoom out axis", () => {
            const axis = mockAxis({
                opposite: true,
                options: {
                    startOnTick: true,
                    endOnTick: true,
                },
                chart: {
                    userOptions: {
                        yAxis: [{ isUserMinMax: false }, { isUserMinMax: false }],
                    },
                },
                min: 20,
                max: 80,
                dataMin: 10,
                dataMax: 90,
                tickInterval: 10,
                tickPositions: [0, 10, 20, 30, 40],
            });
            preventDataCutOff(axis);

            expect(axis.min).toBe(0);
            expect(axis.max).toBe(80);
            expect(axis.tickInterval).toBe(20);
            expect(axis.tickPositions).toEqual([0, 20, 40, 60, 80]);
        });
    });

    describe("shouldBeHandledByHighcharts", () => {
        it("should let Highcharts handle X axis", () => {
            const xAxis = {
                coll: "xAxis",
            } as Highcharts.Axis;
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
            } as Highcharts.Axis;
            expect(shouldBeHandledByHighcharts(yAxis)).toBeTruthy();
        });

        it("should let Highcharts handle line chart", () => {
            const yAxis = {
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
            } as Highcharts.Axis;
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
            } as Highcharts.Axis;
            // use cast here because mock object does not have enough required props
            expect(shouldBeHandledByHighcharts(yAxis)).toBeTruthy();
        });

        it("should let Highcharts handle if any Y axis is disable", () => {
            const yAxis = {
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
            } as Highcharts.Axis;
            expect(shouldBeHandledByHighcharts(yAxis)).toBeTruthy();
        });
    });

    describe("getYAxisScore", () => {
        it.each([
            [Y_AXIS_SCORE.NO_DATA, 0, 0],
            [Y_AXIS_SCORE.ONLY_NEGATIVE_OR_POSITIVE_DATA, 5, 10],
            [Y_AXIS_SCORE.ONLY_NEGATIVE_OR_POSITIVE_DATA, -10, -5],
            [Y_AXIS_SCORE.NEGATIVE_AND_POSITIVE_DATA, -10, 10],
        ])("should score equal to %s", (score: number, dataMin: number, dataMax: number) => {
            const axis = mockAxis({
                dataMin,
                dataMax,
            });
            expect(getYAxisScore(axis)).toBe(score);
        });
    });

    describe("getDirection", () => {
        it.each([
            ["left", null, {}],
            ["right", {}, null],
        ])(
            "should return ALIGN when %s axis is null",
            (_axisSide: string, primaryAxis: Highcharts.Axis, secondaryAxis: Highcharts.Axis) => {
                expect(getDirection(primaryAxis, secondaryAxis)).toBe(ALIGNED);
            },
        );

        it("should return ALIGN when both axes are empty", () => {
            const axis = mockAxis({ tickPositions: [] });
            expect(getDirection(axis, axis)).toBe(ALIGNED);
        });

        it("should return ALIGN when both axes are aligned", () => {
            const axis = mockAxis({ tickPositions: [-2, -1, 0, 1, 2] });
            expect(getDirection(axis, axis)).toBe(ALIGNED);
        });

        it("should return MOVE_ZERO_RIGHT", () => {
            const primaryAxis = mockAxis({ tickPositions: [-2, -1, 0, 1, 2] });
            const secondaryAxis = mockAxis({ tickPositions: [-1, 0, 1, 2, 3] });
            expect(getDirection(primaryAxis, secondaryAxis)).toBe(MOVE_ZERO_RIGHT);
        });

        it("should return MOVE_ZERO_LEFT", () => {
            const primaryAxis = mockAxis({ tickPositions: [-2, -1, 0, 1, 2] });
            const secondaryAxis = mockAxis({ tickPositions: [-3, -2, -1, 0, 1] });
            expect(getDirection(primaryAxis, secondaryAxis)).toBe(MOVE_ZERO_LEFT);
        });
    });

    describe("getSelectionRange", () => {
        it("should return range with data min >= 0", () => {
            const axis = mockAxis({
                dataMin: 10,
                dataMax: 50,
                tickAmount: 4,
                tickPositions: [0, 20, 40, 60, 80],
            });
            expect(getSelectionRange(axis)).toEqual([1, 5]);
        });

        it("should return range with data max <= 0", () => {
            const axis = mockAxis({
                dataMin: -50,
                dataMax: -10,
                tickAmount: 4,
                tickPositions: [-80, -60, -40, -20, 0],
            });
            expect(getSelectionRange(axis)).toEqual([0, 4]);
        });

        it("should return range trimmed from negative", () => {
            const axis = mockAxis({
                dataMin: -70,
                dataMax: 30,
                tickAmount: 6,
                tickPositions: [-80, -60, -40, -20, 0, 20, 40],
            });
            expect(getSelectionRange(axis)).toEqual([1, 7]);
        });

        it("should return range trimmed from positive", () => {
            const axis = mockAxis({
                dataMin: -30,
                dataMax: 70,
                tickAmount: 6,
                tickPositions: [-40, -20, 0, 20, 40, 60, 80],
            });
            expect(getSelectionRange(axis)).toEqual([0, 6]);
        });
    });
});
