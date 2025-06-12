// (C) 2019-2021 GoodData Corporation
import {
    convertNumberToPercent,
    getMinMaxInfo,
    getZeroAlignConfiguration,
} from "../getZeroAlignConfiguration.js";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { StackingType } from "../../../constants/stacking.js";
import { IChartOptions, ISeriesItem } from "../../../typings/unsafe.js";
import { describe, it, expect } from "vitest";

describe("getZeroAlignConfiguration", () => {
    const numberToYValue = (y: number | null) => ({ y });

    const SERIES: ISeriesItem[] = [
        {
            yAxis: 0,
            data: [null, -250, -175, -30, 10, 50, 90, 150].map(numberToYValue),
        },
        {
            yAxis: 1,
            data: [100, 500, 900, 1500, 2400, 1100, 350, null].map(numberToYValue),
        },
    ];

    it("should return empty config without axis", () => {
        const result = getZeroAlignConfiguration({}, {});
        expect(result).toEqual({});
    });

    it("should return empty config with single axis", () => {
        const config = {
            yAxis: [{}],
        };
        const result = getZeroAlignConfiguration({}, config);
        expect(result).toEqual({});
    });

    it("should ignore calculation and return yAxis with empty min/max and 'isUserMinMax' is true", () => {
        const leftAxisConfig = {
            min: 0,
            max: 100,
        };
        const rightAxisConfig = {
            min: 0,
            max: 1000,
        };
        const config = {
            yAxis: [leftAxisConfig, rightAxisConfig],
            series: SERIES,
        };

        const result = getZeroAlignConfiguration({}, config);
        expect(result).toEqual({
            yAxis: [
                {
                    isUserMinMax: true,
                },
                {
                    isUserMinMax: true,
                },
            ],
        });
    });

    it("should return yAxis with calculated min/max and 'isUserMinMax' is false on both Y axes", () => {
        const config = {
            yAxis: [{}, {}],
            series: SERIES,
        };

        const result = getZeroAlignConfiguration({}, config);
        expect(result).toEqual({
            yAxis: [
                {
                    min: -250,
                    max: 150,
                    isUserMinMax: false,
                },
                {
                    min: -4000,
                    max: 2400,
                    isUserMinMax: false,
                },
            ],
        });
    });

    it("should return yAxis with calculated min/max and 'isUserMinMax' is false on single Y axis", () => {
        const config = {
            yAxis: [
                {
                    min: -100,
                    max: 100,
                },
                {},
            ],
            series: SERIES,
        };

        const result = getZeroAlignConfiguration({}, config);
        expect(result).toEqual({
            yAxis: [
                {
                    min: -100,
                    max: 100,
                    isUserMinMax: true,
                },
                {
                    min: -2400,
                    max: 2400,
                    isUserMinMax: false,
                },
            ],
        });
    });

    describe("line chart", () => {
        const POSITIVE_CHART_SERIES: ISeriesItem[] = [
            {
                yAxis: 0,
                data: [250, 175, 30, 10, 50, 90, 150].map(numberToYValue),
            },
            {
                yAxis: 1,
                data: [100, 500, 900, 1500, 2400, 1100, 350].map(numberToYValue),
            },
        ];

        const NEGATIVE_CHART_SERIES: ISeriesItem[] = [
            {
                yAxis: 0,
                data: [-250, -175, -30, -10, -50, -90, -150].map(numberToYValue),
            },
            {
                yAxis: 1,
                data: [-100, -500, -900, -1500, -2400, -1100, -350].map(numberToYValue),
            },
        ];

        const CHART_OPTIONS: IChartOptions = {
            type: VisualizationTypes.LINE,
        };

        it("should return min equal to data min for positive data", () => {
            const config = {
                yAxis: [{}, {}],
                series: POSITIVE_CHART_SERIES,
            };

            const result = getZeroAlignConfiguration(CHART_OPTIONS, config);
            expect(result).toEqual({
                yAxis: [
                    {
                        min: 10,
                        max: 250,
                        isUserMinMax: false,
                    },
                    {
                        min: 100,
                        max: 2400,
                        isUserMinMax: false,
                    },
                ],
            });
        });

        it("should return min equal to data min for negative data", () => {
            const config = {
                yAxis: [{}, {}],
                series: NEGATIVE_CHART_SERIES,
            };

            const result = getZeroAlignConfiguration(CHART_OPTIONS, config);
            expect(result).toEqual({
                yAxis: [
                    {
                        min: -250,
                        max: -10,
                        isUserMinMax: false,
                    },
                    {
                        min: -2400,
                        max: -100,
                        isUserMinMax: false,
                    },
                ],
            });
        });

        it("should return min/max equal to data min/max", () => {
            const config = {
                yAxis: [{}, {}],
                series: [...POSITIVE_CHART_SERIES, ...NEGATIVE_CHART_SERIES],
            };

            const result = getZeroAlignConfiguration(CHART_OPTIONS, config);
            expect(result).toEqual({
                yAxis: [
                    {
                        min: -250,
                        max: 250,
                        isUserMinMax: false,
                    },
                    {
                        min: -2400,
                        max: 2400,
                        isUserMinMax: false,
                    },
                ],
            });
        });
    });

    describe("getMinMaxInfo", () => {
        const SERIES: ISeriesItem[] = [
            {
                yAxis: 0,
                data: [400, 200, 800, -100, 1000, -200, 600].map(numberToYValue),
            },
            {
                yAxis: 0,
                data: [300, 900, 700, 800, -500, 300, -350].map(numberToYValue),
            },
            {
                yAxis: 0,
                data: [100, 200, 300, 400, 500, 600, 700].map(numberToYValue),
            },
            {
                yAxis: 1,
                data: [-250, -175, -30, 10, 50, 90, 150].map(numberToYValue),
            },
            {
                yAxis: 1,
                data: [-500, -400, -300, -200, -100, 0, 100].map(numberToYValue),
            },
            {
                yAxis: 1,
                data: [100, 500, 900, 1500, 2400, 1100, 350].map(numberToYValue),
            },
        ];

        describe("non-stacked chart", () => {
            it.each<[stacking: StackingType, type: string]>([
                [null, VisualizationTypes.LINE],
                [null, VisualizationTypes.COLUMN],
                ["normal", VisualizationTypes.LINE],
            ])("should return min/max when stacking is % s and chart type is %s", (stacking, type) => {
                const config = {
                    yAxis: [{}, {}],
                    series: SERIES,
                };
                const result = getMinMaxInfo(config, stacking, type);
                expect(result).toEqual([
                    {
                        id: 0,
                        min: -500,
                        max: 1000,
                        isSetMin: false,
                        isSetMax: false,
                    },
                    {
                        id: 1,
                        min: -500,
                        max: 2400,
                        isSetMin: false,
                        isSetMax: false,
                    },
                ]);
            });
        });

        describe("stacked chart", () => {
            it("should return min/max in total with normal stack chart", () => {
                const config = {
                    yAxis: [{}, {}],
                    series: SERIES,
                };
                const result = getMinMaxInfo(config, "normal", VisualizationTypes.COLUMN);
                expect(result).toEqual([
                    {
                        id: 0,
                        min: -500,
                        max: 1800,
                        isSetMin: false,
                        isSetMax: false,
                    },
                    {
                        id: 1,
                        min: -750,
                        max: 2450,
                        isSetMin: false,
                        isSetMax: false,
                    },
                ]);
            });

            it("should return min/max in percent with percent stack chart", () => {
                const config = {
                    yAxis: [{ opposite: false }, { opposite: true }],
                    series: SERIES,
                };
                const result = getMinMaxInfo(config, "percent", VisualizationTypes.COLUMN);
                expect(result).toEqual([
                    {
                        id: 0,
                        min: -25,
                        max: 100,
                        isSetMin: false,
                        isSetMax: false,
                    },
                    {
                        id: 1,
                        min: -750,
                        max: 2450,
                        isSetMin: false,
                        isSetMax: false,
                    },
                ]);
            });

            it("should return user-input min/max with normal stack chart", () => {
                const config = {
                    yAxis: [{ min: -100, max: 300 }, { min: 200 }],
                    series: SERIES,
                };
                const result = getMinMaxInfo(config, "normal", VisualizationTypes.COLUMN);
                expect(result).toEqual([
                    {
                        id: 0,
                        min: -100,
                        max: 300,
                        isSetMin: true,
                        isSetMax: true,
                    },
                    {
                        id: 1,
                        min: 200,
                        max: 2450,
                        isSetMin: true,
                        isSetMax: false,
                    },
                ]);
            });

            it("should return user-input min/max with percent stack chart", () => {
                const config = {
                    yAxis: [{ min: 10, max: 80 }, { min: 200 }],
                    series: SERIES,
                };
                const result = getMinMaxInfo(config, "normal", VisualizationTypes.COLUMN);
                expect(result).toEqual([
                    {
                        id: 0,
                        min: 10,
                        max: 80,
                        isSetMin: true,
                        isSetMax: true,
                    },
                    {
                        id: 1,
                        min: 200,
                        max: 2450,
                        isSetMin: true,
                        isSetMax: false,
                    },
                ]);
            });
        });

        describe("with some null data points", () => {
            const SERIES: ISeriesItem[] = [
                {
                    yAxis: 0,
                    data: [null, null].map(numberToYValue),
                },
                {
                    yAxis: 0,
                    data: [null, null].map(numberToYValue),
                },
                {
                    yAxis: 1,
                    data: [250, null].map(numberToYValue),
                },
                {
                    yAxis: 1,
                    data: [250, 50].map(numberToYValue),
                },
            ];

            it.each<[_description: string, stacking: StackingType | null, min: number, max: number]>([
                ["non-stack chart", null, 0, 250],
                ["normal stack chart in total", "normal", 0, 500],
                ["percent stack chart in total", "percent", 0, 100],
            ])("should return min/max with %s", (_description, stacking, min, max) => {
                const config = {
                    yAxis: [{}, {}],
                    series: SERIES,
                };
                const result = getMinMaxInfo(config, stacking, VisualizationTypes.COLUMN);
                expect(result).toEqual([
                    {
                        id: 0,
                        min: 0,
                        max: 0,
                        isSetMin: false,
                        isSetMax: false,
                    },
                    {
                        id: 1,
                        min,
                        max,
                        isSetMin: false,
                        isSetMax: false,
                    },
                ]);
            });

            it("should return user-input min/max with non-stack chart", () => {
                const config = {
                    yAxis: [{ min: 10, max: 100 }, { min: 100 }],
                    series: SERIES,
                };
                const result = getMinMaxInfo(config, null, VisualizationTypes.COLUMN);
                expect(result).toEqual([
                    {
                        id: 0,
                        min: 10,
                        max: 100,
                        isSetMin: true,
                        isSetMax: true,
                    },
                    {
                        id: 1,
                        min: 100,
                        max: 250,
                        isSetMin: true,
                        isSetMax: false,
                    },
                ]);
            });

            it("should return user-input min/max with normal stack chart", () => {
                const config = {
                    yAxis: [{ min: 10, max: 100 }, { min: 100 }],
                    series: SERIES,
                };
                const result = getMinMaxInfo(config, "normal", VisualizationTypes.COLUMN);
                expect(result).toEqual([
                    {
                        id: 0,
                        min: 10,
                        max: 100,
                        isSetMin: true,
                        isSetMax: true,
                    },
                    {
                        id: 1,
                        min: 100,
                        max: 500,
                        isSetMin: true,
                        isSetMax: false,
                    },
                ]);
            });

            it("should return user-input min/max with percent stack chart", () => {
                const config = {
                    yAxis: [{ min: 10, max: 80 }, { min: 20 }],
                    series: SERIES,
                };
                const result = getMinMaxInfo(config, "percent", VisualizationTypes.COLUMN);
                expect(result).toEqual([
                    {
                        id: 0,
                        min: 10,
                        max: 80,
                        isSetMin: true,
                        isSetMax: true,
                    },
                    {
                        id: 1,
                        min: 20,
                        max: 100,
                        isSetMin: true,
                        isSetMax: false,
                    },
                ]);
            });
        });
    });

    describe("invalid min/max", () => {
        const SERIES = [
            {
                yAxis: 0,
                data: [10, 100],
            },
            {
                yAxis: 0,
                data: [20, 200],
            },
            {
                yAxis: 1,
                data: [10, 100],
            },
            {
                yAxis: 1,
                data: [20, 200],
            },
        ];

        it.each([[VisualizationTypes.COLUMN], [VisualizationTypes.LINE]])(
            "should hide left Y axis when min > max in %s chart",
            (chartType: any) => {
                const chartOptions = {
                    type: chartType,
                };
                const config = {
                    yAxis: [
                        {
                            min: 100,
                            max: 10,
                        },
                        {},
                    ],
                    series: SERIES,
                };
                const result = getZeroAlignConfiguration(chartOptions, config);
                expect(result).toEqual({
                    yAxis: [
                        {
                            visible: false,
                        },
                        {},
                    ],
                    series: [
                        {
                            yAxis: 0,
                            visible: false,
                        },
                        {
                            yAxis: 0,
                            visible: false,
                        },
                        {
                            yAxis: 1,
                        },
                        {
                            yAxis: 1,
                        },
                    ],
                });
            },
        );

        it("should hide left and right Y axes when min>max and min=max in column chart", () => {
            const chartOptions = {
                type: VisualizationTypes.COLUMN,
            };
            const config = {
                yAxis: [
                    {
                        min: 100,
                        max: 10,
                    },
                    {
                        min: 100,
                        max: 100,
                    },
                ],
                series: SERIES,
            };
            const result = getZeroAlignConfiguration(chartOptions, config);
            expect(result).toEqual({
                yAxis: [
                    {
                        visible: false,
                    },
                    {
                        visible: false,
                    },
                ],
                series: [
                    {
                        yAxis: 0,
                        visible: false,
                    },
                    {
                        yAxis: 0,
                        visible: false,
                    },
                    {
                        yAxis: 1,
                        visible: false,
                    },
                    {
                        yAxis: 1,
                        visible: false,
                    },
                ],
            });
        });

        it("should hide left axis when min>max and not hide right axis when min=max in line chart", () => {
            const chartOptions = {
                type: VisualizationTypes.LINE,
            };
            const config = {
                yAxis: [
                    {
                        min: 100,
                        max: 10,
                    },
                    {
                        min: 100,
                        max: 100,
                    },
                ],
                series: SERIES,
            };
            const result = getZeroAlignConfiguration(chartOptions, config);
            expect(result).toEqual({
                yAxis: [
                    {
                        visible: false,
                    },
                    {},
                ],
                series: [
                    {
                        yAxis: 0,
                        visible: false,
                    },
                    {
                        yAxis: 0,
                        visible: false,
                    },
                    {
                        yAxis: 1,
                    },
                    {
                        yAxis: 1,
                    },
                ],
            });
        });

        it("should hide left column axis when min>max and not hide right line axis when min=max in combo chart", () => {
            const chartOptions = {
                type: VisualizationTypes.COMBO,
            };
            const series = [
                {
                    type: VisualizationTypes.COLUMN,
                    yAxis: 0,
                    data: [10, 100],
                },
                {
                    type: VisualizationTypes.COLUMN,
                    yAxis: 0,
                    data: [20, 200],
                },
                {
                    type: VisualizationTypes.LINE,
                    yAxis: 1,
                    data: [10, 100],
                },
                {
                    type: VisualizationTypes.LINE,
                    yAxis: 1,
                    data: [20, 200],
                },
            ];
            const config = {
                yAxis: [
                    {
                        min: 100,
                        max: 10,
                    },
                    {
                        min: 100,
                        max: 100,
                    },
                ],
                series,
            };
            const result = getZeroAlignConfiguration(chartOptions, config);
            expect(result).toEqual({
                yAxis: [
                    {
                        visible: false,
                    },
                    {},
                ],
                series: [
                    {
                        type: VisualizationTypes.COLUMN,
                        yAxis: 0,
                        visible: false,
                    },
                    {
                        type: VisualizationTypes.COLUMN,
                        yAxis: 0,
                        visible: false,
                    },
                    {
                        type: VisualizationTypes.LINE,
                        yAxis: 1,
                    },
                    {
                        type: VisualizationTypes.LINE,
                        yAxis: 1,
                    },
                ],
            });
        });

        it("should hide Y axes when min>max in combo chart", () => {
            const chartOptions = {
                type: VisualizationTypes.COMBO,
            };
            const series = [
                {
                    type: VisualizationTypes.COLUMN,
                    yAxis: 0,
                    data: [10, 100],
                },
                {
                    type: VisualizationTypes.COLUMN,
                    yAxis: 0,
                    data: [20, 200],
                },
                {
                    type: VisualizationTypes.LINE,
                    yAxis: 1,
                    data: [10, 100],
                },
                {
                    type: VisualizationTypes.LINE,
                    yAxis: 1,
                    data: [20, 200],
                },
            ];
            const config = {
                yAxis: [
                    {
                        min: 100,
                        max: 10,
                    },
                    {
                        min: 200,
                        max: 100,
                    },
                ],
                series,
            };
            const result = getZeroAlignConfiguration(chartOptions, config);
            expect(result).toEqual({
                yAxis: [
                    {
                        visible: false,
                    },
                    {
                        visible: false,
                    },
                ],
                series: [
                    {
                        type: VisualizationTypes.COLUMN,
                        yAxis: 0,
                        visible: false,
                    },
                    {
                        type: VisualizationTypes.COLUMN,
                        yAxis: 0,
                        visible: false,
                    },
                    {
                        type: VisualizationTypes.LINE,
                        yAxis: 1,
                        visible: false,
                    },
                    {
                        type: VisualizationTypes.LINE,
                        yAxis: 1,
                        visible: false,
                    },
                ],
            });
        });
    });

    describe("convertNumberToPercent", () => {
        it("should convert number to percent", () => {
            const data: number[][] = [
                [1, 2, 7],
                [10, 40, null],
                [10, 90, null],
                [null, null, null],
                [null, 20, null],
            ];
            const result = convertNumberToPercent(data);
            expect(result).toEqual([[10, 20, 70], [20, 80], [10, 90], [], [100]]);
        });
    });
});
