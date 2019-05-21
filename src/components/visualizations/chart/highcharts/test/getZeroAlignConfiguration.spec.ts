// (C) 2019 GoodData Corporation
import { getMinMaxInfo, getZeroAlignConfiguration } from "../getZeroAlignConfiguration";
import { NORMAL_STACK, PERCENT_STACK } from "../getOptionalStackingConfiguration";
import { VisualizationTypes } from "../../../../../constants/visualizationTypes";
import { ISeriesItem, IChartOptions } from "../../../../../interfaces/Config";

describe("getZeroAlignConfiguration", () => {
    const SERIES: ISeriesItem[] = [
        {
            yAxis: 0,
            data: [null, -250, -175, -30, 10, 50, 90, 150].map((num: number) => ({ y: num })),
        },
        {
            yAxis: 1,
            data: [100, 500, 900, 1500, 2400, 1100, 350, null].map((num: number) => ({ y: num })),
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
                data: [250, 175, 30, 10, 50, 90, 150].map((num: number) => ({ y: num })),
            },
            {
                yAxis: 1,
                data: [100, 500, 900, 1500, 2400, 1100, 350].map((num: number) => ({ y: num })),
            },
        ];

        const NEGATIVE_CHART_SERIES: ISeriesItem[] = [
            {
                yAxis: 0,
                data: [-250, -175, -30, -10, -50, -90, -150].map((num: number) => ({ y: num })),
            },
            {
                yAxis: 1,
                data: [-100, -500, -900, -1500, -2400, -1100, -350].map((num: number) => ({ y: num })),
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
                data: [400, 200, 800, -100, 1000, -200, 600].map((num: number) => ({ y: num })),
            },
            {
                yAxis: 0,
                data: [300, 900, 700, 800, -500, 300, -350].map((num: number) => ({ y: num })),
            },
            {
                yAxis: 0,
                data: [100, 200, 300, 400, 500, 600, 700].map((num: number) => ({ y: num })),
            },
            {
                yAxis: 1,
                data: [-250, -175, -30, 10, 50, 90, 150].map((num: number) => ({ y: num })),
            },
            {
                yAxis: 1,
                data: [-500, -400, -300, -200, -100, 0, 100].map((num: number) => ({ y: num })),
            },
            {
                yAxis: 1,
                data: [100, 500, 900, 1500, 2400, 1100, 350].map((num: number) => ({ y: num })),
            },
        ];

        describe("non-stacked chart", () => {
            it.each([
                [null, VisualizationTypes.LINE],
                [null, VisualizationTypes.COLUMN],
                [NORMAL_STACK, VisualizationTypes.LINE],
            ])(
                "should return min/max when stacking is % s and chart type is %s",
                (stacking: string, type: string) => {
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
                },
            );
        });

        describe("stacked chart", () => {
            it("should return min/max in total with normal stack chart", () => {
                const config = {
                    yAxis: [{}, {}],
                    series: SERIES,
                };
                const result = getMinMaxInfo(config, NORMAL_STACK, VisualizationTypes.COLUMN);
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
                const result = getMinMaxInfo(config, PERCENT_STACK, VisualizationTypes.COLUMN);
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
                const result = getMinMaxInfo(config, NORMAL_STACK, VisualizationTypes.COLUMN);
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
                const result = getMinMaxInfo(config, NORMAL_STACK, VisualizationTypes.COLUMN);
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
            (chartType: string) => {
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
});
