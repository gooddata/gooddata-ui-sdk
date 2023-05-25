// (C) 2007-2021 GoodData Corporation
import {
    shouldFollowPointer,
    shouldFollowPointerForDualAxes,
    shouldStartOnTick,
    shouldEndOnTick,
    getChartProperties,
    pointInRange,
    getStackedMaxValue,
    getStackedMinValue,
    shouldXAxisStartOnTickOnBubbleScatter,
    shouldYAxisStartOnTickOnBubbleScatter,
    alignChart,
} from "../helpers.js";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { ChartAlignTypes, IChartConfig } from "../../../../interfaces/index.js";
import { BOTTOM, TOP } from "../../../constants/alignments.js";
import { describe, it, expect, vi } from "vitest";

describe("helpers", () => {
    describe("getChartProperties", () => {
        const config: IChartConfig = {
            xaxis: {
                rotation: "60",
                visible: false,
            },
            yaxis: {
                labelsEnabled: true,
            },
        };

        it("should return properties from config", () => {
            expect(getChartProperties(config, VisualizationTypes.COLUMN)).toEqual({
                xAxisProps: { rotation: "60", visible: false },
                yAxisProps: { labelsEnabled: true },
            });
        });

        it("should return properties from config for bar chart with switched axes", () => {
            expect(getChartProperties(config, VisualizationTypes.BAR)).toEqual({
                yAxisProps: { rotation: "60", visible: false },
                xAxisProps: { labelsEnabled: true },
            });
        });
    });

    describe("shouldStartOnTick, shouldEndOnTick", () => {
        const nonStackedChartOptions = {
            hasStackByAttribute: false,
            data: {
                series: [
                    {
                        data: [{ y: 20 }],
                        visible: true,
                    },
                ],
            },
        };

        const stackedChartOptions = {
            hasStackByAttribute: true,
            data: {
                series: [
                    {
                        data: [{ y: 20 }, { y: 10 }, { y: 5 }],
                        visible: true,
                    },
                ],
            },
        };

        describe("shouldStartOnTick", () => {
            it("should return false when min and max are set", () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: { min: "5", max: "10" },
                };
                expect(shouldStartOnTick(chartOptions)).toBeFalsy();
            });

            it("should return false when min is greater than max", () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: { min: "10", max: "5" },
                };

                expect(shouldStartOnTick(chartOptions)).toBeTruthy();
            });

            it("should return false if max is set but greater than min data value (non stacked)", () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: { max: "40" },
                };

                expect(shouldStartOnTick(chartOptions)).toBeFalsy();
            });

            it("should return false if max is set but greater than min data value (stacked)", () => {
                const chartOptions = {
                    ...stackedChartOptions,
                    yAxisProps: { max: "40" },
                };

                expect(shouldStartOnTick(chartOptions)).toBeFalsy();
            });

            it("should return true when no max or min are set", () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: {},
                };

                expect(shouldStartOnTick(chartOptions)).toBeTruthy();
            });

            it("should return true if max is set but smaller than min data value (non stacked)", () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: { max: "-40" },
                };

                expect(shouldStartOnTick(chartOptions)).toBeTruthy();
            });

            it("should return true if max is set but smaller than min data value (stacked)", () => {
                const chartOptions = {
                    ...stackedChartOptions,
                    yAxisProps: { max: "-40" },
                };

                expect(shouldStartOnTick(chartOptions)).toBeTruthy();
            });
        });

        describe("shouldEndOnTick", () => {
            it("should return false when min and max are set", () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: { min: "5", max: "10" },
                };
                expect(shouldEndOnTick(chartOptions)).toBeFalsy();
            });

            it("should return false when min is greater than max", () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: { min: "10", max: "5" },
                };

                expect(shouldEndOnTick(chartOptions)).toBeTruthy();
            });

            it("should return false if min is set but smaller than max data value (non stacked)", () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: { min: "1" },
                };

                expect(shouldEndOnTick(chartOptions)).toBeFalsy();
            });

            it("should return false if min is set but smaller than max data value (stacked)", () => {
                const chartOptions = {
                    ...stackedChartOptions,
                    yAxisProps: { min: "1" },
                };

                expect(shouldEndOnTick(chartOptions)).toBeFalsy();
            });

            it("should return true when no max or min are set", () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: {},
                };

                expect(shouldEndOnTick(chartOptions)).toBeTruthy();
            });

            it("should return true if min is set but bigger than max data value (non stacked)", () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: { min: "40" },
                };

                expect(shouldEndOnTick(chartOptions)).toBeTruthy();
            });

            it("should return true if min is set but bigger than max data value (stacked)", () => {
                const chartOptions = {
                    ...stackedChartOptions,
                    yAxisProps: { min: "40" },
                };

                expect(shouldEndOnTick(chartOptions)).toBeTruthy();
            });
        });

        describe("shouldXAxisStartOnTickOnBubbleScatter", () => {
            it("should return true when min is not set", () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                };

                expect(shouldXAxisStartOnTickOnBubbleScatter(chartOptions)).toBeTruthy();
            });

            it("should return false when min is set", () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    xAxisProps: { min: "40" },
                };

                expect(shouldXAxisStartOnTickOnBubbleScatter(chartOptions)).toBeFalsy();
            });
        });

        describe("shouldYAxisStartOnTickOnBubbleScatter", () => {
            it("should return true when min is not set", () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                };

                expect(shouldYAxisStartOnTickOnBubbleScatter(chartOptions)).toBeTruthy();
            });

            it("should return false when min is set", () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: { min: "10" },
                };

                expect(shouldYAxisStartOnTickOnBubbleScatter(chartOptions)).toBeFalsy();
            });

            it("should return true if min is set but bigger than max data value (non stacked)", () => {
                const chartOptions = {
                    ...nonStackedChartOptions,
                    yAxisProps: { min: "40" },
                };

                expect(shouldEndOnTick(chartOptions)).toBeTruthy();
            });
        });
    });

    describe("shouldFollowPointer", () => {
        const nonStackedChartOptions = {
            type: VisualizationTypes.COLUMN,
            yAxes: [{ label: "atitle" }],
            xAxes: [{ label: "xtitle" }],
            data: {
                series: [
                    {
                        color: "rgb(0, 0, 0)",
                        name: "<b>aaa</b>",
                        data: [
                            {
                                name: "data1",
                                y: 50,
                            },
                            {
                                name: "data2",
                                y: 150,
                            },
                            {
                                name: "data3",
                                y: -12,
                            },
                        ],
                        visible: true,
                    },
                ],
            },
        };

        const stackedChartOptions = {
            type: VisualizationTypes.COLUMN,
            hasStackByAttribute: true,
            yAxes: [{ label: "atitle" }],
            xAxes: [{ label: "xtitle" }],
            data: {
                series: [
                    {
                        color: "rgb(0, 0, 0)",
                        name: "<b>aaa</b>",
                        data: [
                            {
                                name: "data1",
                                y: 25,
                            },
                            {
                                name: "data2",
                                y: 75,
                            },
                            {
                                name: "data3",
                                y: -12,
                            },
                        ],
                        visible: true,
                    },
                    {
                        color: "rgb(0, 0, 0)",
                        name: "<b>bbb</b>",
                        data: [
                            {
                                name: "data1",
                                y: 25,
                            },
                            {
                                name: "data2",
                                y: 75,
                            },
                            {
                                name: "data3",
                                y: -12,
                            },
                        ],
                        visible: true,
                    },
                ],
            },
        };

        const stackedChartOptionsPositiveValues = {
            data: {
                series: [
                    {
                        color: "rgb(20,178,226)",
                        data: [
                            {
                                y: 27,
                                name: "AAAA",
                            },
                        ],
                        name: "AAAA",
                    },
                    {
                        color: "rgb(0,193,141)",
                        data: [
                            {
                                y: 26,
                                name: "BBBB",
                            },
                        ],
                        name: "BBBB",
                    },
                    {
                        color: "rgb(229,77,66)",
                        data: [
                            {
                                y: 26,
                                name: "CCCC",
                            },
                        ],
                        name: "CCCC",
                    },
                    {
                        color: "rgb(241,134,0)",
                        data: [
                            {
                                y: 29,
                                name: "DDDD",
                            },
                        ],
                        name: "DDDD",
                    },
                ],
            },
        };

        const stackedChartOptionsNegativeValues = {
            data: {
                series: [
                    {
                        color: "rgb(20,178,226)",
                        data: [
                            {
                                y: -27,
                                name: "AAAA",
                            },
                        ],
                        name: "AAAA",
                    },
                    {
                        color: "rgb(0,193,141)",
                        data: [
                            {
                                y: -26,
                                name: "BBBB",
                            },
                        ],
                        name: "BBBB",
                    },
                    {
                        color: "rgb(229,77,66)",
                        data: [
                            {
                                y: -26,
                                name: "CCCC",
                            },
                        ],
                        name: "CCCC",
                    },
                    {
                        color: "rgb(241,134,0)",
                        data: [
                            {
                                y: -29,
                                name: "DDDD",
                            },
                        ],
                        name: "DDDD",
                    },
                ],
            },
        };

        describe("Non stacked chart", () => {
            it("should return false when no extremes are defined", () => {
                const result = shouldFollowPointer({
                    ...nonStackedChartOptions,
                    xAxisProps: {},
                    yAxisProps: {},
                });

                expect(result).toBeFalsy();
            });

            it("should return false when data values are in axis range", () => {
                const result = shouldFollowPointer({
                    ...nonStackedChartOptions,
                    yAxisProps: {
                        min: "-30",
                        max: "200",
                    },
                });

                expect(result).toBeFalsy();
            });

            it("should return true when min is in negative value", () => {
                const result = shouldFollowPointer({
                    ...nonStackedChartOptions,
                    yAxisProps: {
                        min: "-10",
                    },
                });

                expect(result).toBeTruthy();
            });

            it("should return true when min and max are within data values", () => {
                const result = shouldFollowPointer({
                    ...nonStackedChartOptions,
                    yAxisProps: {
                        min: "60",
                        max: "100",
                    },
                });

                expect(result).toBeTruthy();
            });

            it("should return true when min is bigger than minimal value", () => {
                const result = shouldFollowPointer({
                    ...nonStackedChartOptions,
                    yAxisProps: {
                        min: "0",
                    },
                });

                expect(result).toBeTruthy();
            });
        });

        describe("Stacked chart", () => {
            it("should return false when no extremes are defined", () => {
                const result = shouldFollowPointer({
                    ...stackedChartOptions,
                    xAxisProps: {},
                    yAxisProps: {},
                });

                expect(result).toBeFalsy();
            });

            it("should return false when data values are in axis range", () => {
                const result = shouldFollowPointer({
                    ...stackedChartOptions,
                    yAxisProps: {
                        min: "-30",
                        max: "200",
                    },
                });

                expect(result).toBeFalsy();
            });

            it("should return true when min and max are within data values", () => {
                const result = shouldFollowPointer({
                    ...stackedChartOptions,
                    yAxisProps: {
                        min: "60",
                        max: "100",
                    },
                });

                expect(result).toBeTruthy();
            });

            it("should return true when min is bigger 0 and less than min seriesValue", () => {
                const result = shouldFollowPointer({
                    ...stackedChartOptionsPositiveValues,
                    yAxisProps: {
                        min: "20",
                    },
                });

                expect(result).toBeTruthy();
            });

            it("should return true when max is negative and max less than min seriesValue", () => {
                const result = shouldFollowPointer({
                    ...stackedChartOptionsNegativeValues,
                    yAxisProps: {
                        max: "-20",
                    },
                });

                expect(result).toBeTruthy();
            });
        });
    });

    describe("shouldFollowPointerForAxes", () => {
        const dualAxesChartOptions = {
            type: VisualizationTypes.COLUMN,
            yAxes: [{ label: "atitle" }, { label: "btitle" }],
            xAxes: [{ label: "xtitle" }],
            data: {
                series: [
                    {
                        color: "rgb(0, 0, 0)",
                        name: "aaa",
                        data: [
                            {
                                name: "data1",
                                y: 25,
                            },
                            {
                                name: "data2",
                                y: 75,
                            },
                            {
                                name: "data3",
                                y: -12,
                            },
                        ],
                        visible: true,
                    },
                    {
                        color: "rgb(0, 0, 0)",
                        name: "bbb",
                        data: [
                            {
                                name: "data1",
                                y: 25,
                            },
                            {
                                name: "data2",
                                y: 75,
                            },
                            {
                                name: "data3",
                                y: -12,
                            },
                        ],
                        yAxis: 1,
                        visible: true,
                    },
                ],
            },
        };

        it("should return false when there is one Y axis", () => {
            const chartOptions = {
                ...dualAxesChartOptions,
                yAxes: [{ label: "atitle" }],
            };
            const result = shouldFollowPointerForDualAxes(chartOptions);
            expect(result).toBeFalsy();
        });

        it("should return false when min/max is not set", () => {
            const result = shouldFollowPointerForDualAxes(dualAxesChartOptions);
            expect(result).toBeFalsy();
        });

        it("should return true when min/max is set in left Y axis", () => {
            const chartOptions = {
                ...dualAxesChartOptions,
                yAxisProps: {
                    min: "10",
                    max: "20",
                },
            };
            const result = shouldFollowPointerForDualAxes(chartOptions);
            expect(result).toBeTruthy();
        });

        it("should return true when min/max is set in right Y axis", () => {
            const chartOptions = {
                ...dualAxesChartOptions,
                secondary_yAxisProps: {
                    min: "10",
                    max: "20",
                },
            };
            const result = shouldFollowPointerForDualAxes(chartOptions);
            expect(result).toBeTruthy();
        });

        it("should return true when min/max is set in both Y axes", () => {
            const chartOptions = {
                ...dualAxesChartOptions,
                yAxisProps: {
                    min: "10",
                    max: "20",
                },
                secondary_yAxisProps: {
                    min: "10",
                    max: "20",
                },
            };
            const result = shouldFollowPointerForDualAxes(chartOptions);
            expect(result).toBeTruthy();
        });
    });

    describe("pointInRange", () => {
        it("should return true when data point is in the axis range", () => {
            expect(
                pointInRange(5, {
                    minAxisValue: 2,
                    maxAxisValue: 8,
                }),
            ).toBeTruthy();
        });

        it("should return true when data point is on the left edge of axis range", () => {
            expect(
                pointInRange(5, {
                    minAxisValue: 5,
                    maxAxisValue: 8,
                }),
            ).toBeTruthy();
        });

        it("should return true when data point is on the right edge of axis range", () => {
            expect(
                pointInRange(5, {
                    minAxisValue: 2,
                    maxAxisValue: 5,
                }),
            ).toBeTruthy();
        });

        it("should return false when data point is outside of axis range", () => {
            expect(
                pointInRange(5, {
                    minAxisValue: -5,
                    maxAxisValue: 2,
                }),
            ).toBeFalsy();
        });
    });
    describe("getStackedExtremeValues", () => {
        const seriesNegativeAndPositiveValues = [
            {
                color: "rgb(0, 0, 0)",
                name: "<b>aaa</b>",
                data: [
                    {
                        name: "data1",
                        y: 25,
                    },
                    {
                        name: "data2",
                        y: 75,
                    },
                    {
                        name: "data3",
                        y: 30,
                    },
                ],
                visible: true,
            },
            {
                color: "rgb(0, 0, 0)",
                name: "<b>bbb</b>",
                data: [
                    {
                        name: "data1",
                        y: -25,
                    },
                    {
                        name: "data2",
                        y: -75,
                    },
                    {
                        name: "data3",
                        y: -30,
                    },
                ],
                visible: true,
            },
            {
                color: "rgb(0, 0, 0)",
                name: "<b>bbb</b>",
                data: [
                    {
                        name: "data1",
                        y: 15,
                    },
                    {
                        name: "data2",
                        y: 60,
                    },
                    {
                        name: "data3",
                        y: 20,
                    },
                ],
                visible: true,
            },
            {
                color: "rgb(0, 0, 0)",
                name: "<b>bbb</b>",
                data: [
                    {
                        name: "data1",
                        y: -15,
                    },
                    {
                        name: "data2",
                        y: -60,
                    },
                    {
                        name: "data3",
                        y: -20,
                    },
                ],
                visible: true,
            },
        ];

        const negativeValues = [
            {
                color: "rgb(0, 0, 0)",
                name: "<b>bbb</b>",
                data: [
                    {
                        name: "data1",
                        y: -25,
                    },
                    {
                        name: "data2",
                        y: -75,
                    },
                    {
                        name: "data3",
                        y: -30,
                    },
                ],
                visible: true,
            },
            {
                color: "rgb(0, 0, 0)",
                name: "<b>bbb</b>",
                data: [
                    {
                        name: "data1",
                        y: -15,
                    },
                    {
                        name: "data2",
                        y: -60,
                    },
                    {
                        name: "data3",
                        y: -20,
                    },
                ],
                visible: true,
            },
        ];

        describe("getStackedMaxValue", () => {
            it("should match output for negative and positive values", () => {
                const result = getStackedMaxValue(seriesNegativeAndPositiveValues);
                expect(result).toEqual(135);
            });

            it("should match output for negative values", () => {
                const result = getStackedMaxValue(negativeValues);
                expect(result).toEqual(-15);
            });
        });

        describe("getStackedMinValue", () => {
            it("should match output for negative and positive values", () => {
                const result = getStackedMinValue(seriesNegativeAndPositiveValues);
                expect(result).toEqual(-135);
            });

            it("should match output for negative values", () => {
                const result = getStackedMinValue(negativeValues);
                expect(result).toEqual(-135);
            });
        });
    });

    describe("getChartAlignmentConfiguration", () => {
        function getCommonChartOptionsMock(width: number, height: number) {
            const getBoundingClientRect = vi.fn().mockReturnValue({ width, height });
            return {
                options: {
                    chart: {
                        type: VisualizationTypes.DONUT,
                    },
                },
                container: {
                    getBoundingClientRect,
                },
                update: vi.fn(),
            };
        }

        it.each([
            [TOP, 0, undefined, undefined, 100],
            [BOTTOM, undefined, 0, 100, undefined],
        ])(
            "should update chart margin %s",
            (
                verticalAlign: ChartAlignTypes,
                spacingTop: number,
                spacingBottom: number,
                marginTop: number,
                marginBottom: number,
            ) => {
                const chart: any = {
                    ...getCommonChartOptionsMock(200, 300),
                    userOptions: {
                        chart: {
                            verticalAlign,
                        },
                    },
                };

                alignChart(chart, verticalAlign);

                expect(chart.update).toBeCalledWith(
                    {
                        chart: {
                            spacingTop,
                            spacingBottom,
                            marginTop,
                            marginBottom,
                            className: `s-highcharts-donut-aligned-to-${verticalAlign}`,
                        },
                    },
                    false,
                    false,
                    false,
                );
            },
        );

        it("should not update when rectangle container is horizontal", () => {
            const chart: any = {
                ...getCommonChartOptionsMock(300, 200),
            };

            alignChart(chart, "middle");

            expect(chart.update).toBeCalledWith(
                {
                    chart: {
                        spacingTop: undefined,
                        spacingBottom: undefined,
                        marginTop: undefined,
                        marginBottom: undefined,
                        className: "s-highcharts-donut-aligned-to-middle",
                    },
                },
                false,
                false,
                false,
            );
        });

        it.each([["middle"], [undefined]])(
            "should not update when verticalAlign is %s",
            (verticalAlign: ChartAlignTypes) => {
                const chart: any = {
                    ...getCommonChartOptionsMock(200, 300),
                    userOptions: {
                        chart: {
                            verticalAlign,
                        },
                    },
                };

                alignChart(chart, verticalAlign);

                expect(chart.update).toBeCalledWith(
                    {
                        chart: {
                            spacingTop: undefined,
                            spacingBottom: undefined,
                            marginTop: undefined,
                            marginBottom: undefined,
                            className: "s-highcharts-donut-aligned-to-middle",
                        },
                    },
                    false,
                    false,
                    false,
                );
            },
        );
    });
});
