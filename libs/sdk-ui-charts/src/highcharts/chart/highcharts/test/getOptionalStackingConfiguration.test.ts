// (C) 2007-2020 GoodData Corporation
import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import Highcharts from "../highchartsEntryPoint";
import getOptionalStackingConfiguration, {
    convertMinMaxFromPercentToNumber,
    getParentAttributeConfiguration,
    getSanitizedStackingForSeries,
    getShowInPercentConfiguration,
    getStackMeasuresConfiguration,
    getYAxisConfiguration,
    setDrillConfigToXAxis,
    PERCENT_STACK,
    NORMAL_STACK,
} from "../getOptionalStackingConfiguration";
import { IDrillConfig, VisualizationTypes } from "@gooddata/sdk-ui";
import { IChartConfig, ISeriesItem, IChartOptions } from "../../../Config";
import { BLACK_LABEL, WHITE_LABEL } from "../../../constants/label";

describe("getOptionalStackingConfiguration", () => {
    it("should return empty configuration to not supported chart type", () => {
        expect(getOptionalStackingConfiguration({ type: VisualizationTypes.LINE }, undefined)).toEqual({});
    });

    it("should set drillConfig to X axis", () => {
        const dataView = dummyDataView({
            attributes: [],
            buckets: [],
            dimensions: [],
            filters: [],
            measures: [],
            sortBy: [],
            workspace: "",
        });

        const drillConfig: IDrillConfig = {
            dataView,
            onDrill: () => false,
        };
        const result = setDrillConfigToXAxis(drillConfig);
        expect(result.xAxis[0].drillConfig).toEqual(drillConfig);
    });

    describe("getParentAttributeConfiguration", () => {
        it.each([
            [
                VisualizationTypes.COLUMN,
                {
                    xAxis: [
                        {
                            labels: {
                                groupedOptions: [
                                    {
                                        style: { fontWeight: "bold" },
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
            [
                VisualizationTypes.BAR,
                {
                    xAxis: [
                        {
                            labels: {
                                groupedOptions: [
                                    {
                                        style: { fontWeight: "bold" },
                                        x: -5,
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        ])(
            "should return parent attribute configuration for %s chart",
            (type: string, expectedConfig: any) => {
                const chartOptions = { type };
                const config = { xAxis: [{}] };
                const result = getParentAttributeConfiguration(chartOptions, config);

                expect(result).toEqual(expectedConfig);
            },
        );
    });

    describe("getStackMeasuresConfiguration", () => {
        it.each([
            ["undefined", {}],
            [
                "false",
                {
                    stackMeasures: false,
                    stackMeasuresToPercent: false,
                },
            ],
        ])(
            "should return empty configuration when stack options are %s",
            (_: string, chartConfig: IChartConfig) => {
                const result = getStackMeasuresConfiguration(
                    { type: VisualizationTypes.COLUMN },
                    {},
                    chartConfig,
                );
                expect(result).toEqual({});
            },
        );

        it.each([
            [NORMAL_STACK, { stackMeasures: true }],
            [PERCENT_STACK, { stackMeasuresToPercent: true }],
        ])("should return series config with %s stacking", (type: any, chartConfig: IChartConfig) => {
            const chartOptions = { yAxes: [{}] };
            const config = { series: Array(2).fill({ yAxis: 0 }) };

            const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
            expect(result).toEqual({
                series: Array(2).fill({
                    yAxis: 0,
                    stack: 0,
                    stacking: type,
                }),
            });
        });

        it('should "stackMeasuresToPercent" always overwrite "stackMeasures" setting', () => {
            const chartOptions = { yAxes: [{}] };
            const config = { series: Array(2).fill({ yAxis: 0 }) };
            const chartConfig = {
                stackMeasures: true,
                stackMeasuresToPercent: true,
            };

            const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
            expect(result).toEqual({
                series: Array(2).fill({
                    yAxis: 0,
                    stack: 0,
                    stacking: PERCENT_STACK,
                }),
            });
        });

        it("should return series with stacking config with normal stacking for dual axis", () => {
            const chartOptions = {
                type: VisualizationTypes.COLUMN,
                yAxes: [{}, {}],
            };
            const config = {
                yAxis: [{}, {}],
                series: [...Array(2).fill({ yAxis: 0 }), ...Array(2).fill({ yAxis: 1 })],
            };
            const chartConfig = { stackMeasures: true };

            const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
            expect(result).toEqual({
                series: [
                    ...Array(2).fill({
                        yAxis: 0, // primary Y axis
                        stack: 0,
                        stacking: NORMAL_STACK,
                    }),
                    ...Array(2).fill({
                        yAxis: 1, // secondary Y axis
                        // stack is reset for secondary Y axis
                        stack: null,
                        // stacking on secondary Y axis is reset when stackMeasures is false
                        stacking: NORMAL_STACK,
                    }),
                ],
                yAxis: Array(2).fill({
                    stackLabels: { enabled: true },
                }),
            });
        });

        it('should return series without "stackMeasuresToPercent" config for measure on right axis of dual axis', () => {
            const chartOptions = {
                type: VisualizationTypes.COLUMN,
                yAxes: [{}, {}],
            };
            const config = {
                yAxis: [{}, {}],
                series: [
                    {
                        yAxis: 0,
                    },
                    {
                        yAxis: 1,
                    },
                ],
            };
            const chartConfig = { stackMeasuresToPercent: true };

            const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
            expect(result).toEqual({
                series: [
                    {
                        yAxis: 0, // primary Y axis
                        // stack + stacking on primary Y axis is keep as is
                        stack: 0,
                        stacking: PERCENT_STACK,
                    },
                    {
                        yAxis: 1, // secondary Y axis
                        // stack is resetted for secondary Y axis
                        stack: null,
                        // stacking on secondary Y axis is resetted to "normal"
                        stacking: NORMAL_STACK,
                    },
                ],
                yAxis: [
                    {
                        stackLabels: { enabled: false },
                    },
                    {
                        stackLabels: { enabled: true },
                    },
                ],
            });
        });

        it('should return series with "stackMeasures" config with one measure in each axis for dual axis', () => {
            const chartOptions = {
                type: VisualizationTypes.COLUMN,
                yAxes: [{}, {}],
            };
            const config = {
                yAxis: [{}, {}],
                series: [
                    {
                        yAxis: 0,
                    },
                    {
                        yAxis: 1,
                    },
                ],
            };
            const chartConfig = { stackMeasures: true };

            const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
            expect(result).toEqual({
                series: [
                    {
                        yAxis: 0, // primary Y axis
                        // stack + stacking on primary Y axis is keep as is
                        stack: 0,
                        stacking: NORMAL_STACK,
                    },
                    {
                        yAxis: 1, // secondary Y axis
                        // stack is resetted for secondary Y axis
                        stack: null,
                        // stacking on secondary Y axis is resetted when stackMeasuresToPercent is true
                        stacking: NORMAL_STACK,
                    },
                ],
                yAxis: Array(2).fill({
                    stackLabels: { enabled: true },
                }),
            });
        });

        it.each([
            ["", true],
            ["", "auto"],
            [" not", false],
        ])(
            'should%s show stack label when "dataLabel.visible" is %s',
            (_negation: string, visible: boolean | string) => {
                const chartOptions = {
                    type: VisualizationTypes.COLUMN,
                    yAxes: [{}],
                };
                const config = {
                    series: [{ yAxis: 0 }],
                    yAxis: [{}],
                };
                const chartConfig = {
                    stackMeasures: true,
                    dataLabels: { visible },
                };
                const { yAxis }: any = getStackMeasuresConfiguration(chartOptions, config, chartConfig);

                expect(yAxis).toEqual(
                    Array(1).fill({
                        stackLabels: { enabled: Boolean(visible) },
                    }),
                );
            },
        );

        it('should not return "yAxis.stackLabels" to bar chart by default', () => {
            // the template in 'barConfiguration.ts' turns stackLabels off by default
            const chartOptions = {
                type: VisualizationTypes.BAR,
                yAxes: [{}],
            };
            const config = {
                series: [{ yAxis: 0 }],
                yAxis: [{}],
            };
            const chartConfig = {
                stackMeasures: true,
            };
            const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
            expect(result).not.toHaveProperty("yAxis.stackLabels");
        });

        describe("Stack Measures in Combo chart", () => {
            const chartOptions = {
                type: VisualizationTypes.COMBO,
                yAxes: [{ opposite: false }, { opposite: true }],
            };

            it.each([
                ["stackMeasures", VisualizationTypes.COLUMN, NORMAL_STACK, WHITE_LABEL],
                ["stackMeasures", VisualizationTypes.AREA, NORMAL_STACK, BLACK_LABEL],
                ["stackMeasuresToPercent", VisualizationTypes.COLUMN, PERCENT_STACK, WHITE_LABEL],
                ["stackMeasuresToPercent", VisualizationTypes.AREA, PERCENT_STACK, BLACK_LABEL],
            ])(
                "should return series with %s config if series type is %s",
                (stackConfig: string, type: string, stackType: string, labelStyle: Highcharts.CSSObject) => {
                    const config = {
                        yAxis: [{}, {}],
                        series: [
                            {
                                yAxis: 0,
                                type,
                            },
                            {
                                yAxis: 1,
                                type: VisualizationTypes.LINE,
                            },
                        ],
                    };
                    const chartConfig = { [stackConfig]: true };
                    const { series } = getStackMeasuresConfiguration(chartOptions, config, chartConfig);

                    expect(series).toEqual([
                        {
                            yAxis: 0,
                            stack: 0,
                            stacking: stackType,
                            type,
                            dataLabels: { style: labelStyle },
                        },
                        {
                            yAxis: 1,
                            stack: null,
                            stacking: null,
                            type: VisualizationTypes.LINE,
                            dataLabels: { style: BLACK_LABEL },
                        },
                    ]);
                },
            );

            it.each(["stackMeasures", "stackMeasuresToPercent"])(
                "should NOT apply %s if series type is Line chart",
                (stackConfig: string) => {
                    const config = {
                        yAxis: [{}, {}],
                        series: [
                            {
                                yAxis: 0,
                                type: VisualizationTypes.LINE,
                            },
                            {
                                yAxis: 1,
                                type: VisualizationTypes.AREA,
                            },
                        ],
                    };
                    const chartConfig = { [stackConfig]: true };
                    const { series } = getStackMeasuresConfiguration(chartOptions, config, chartConfig);

                    expect(series).toEqual([
                        {
                            yAxis: 0,
                            stack: 0,
                            stacking: null,
                            type: VisualizationTypes.LINE,
                            dataLabels: { style: BLACK_LABEL },
                        },
                        {
                            yAxis: 1,
                            stack: null,
                            stacking: null,
                            type: VisualizationTypes.AREA,
                            dataLabels: { style: BLACK_LABEL },
                        },
                    ]);
                },
            );

            it.each([
                ["stackMeasures", NORMAL_STACK],
                ["stackMeasuresToPercent", PERCENT_STACK],
            ])("should NOT apply %s on secondary y-axis", (stackConfig: string, stackType: string) => {
                const config = {
                    yAxis: [{}, {}],
                    series: [
                        {
                            yAxis: 0,
                            type: VisualizationTypes.COLUMN,
                        },
                        {
                            yAxis: 1,
                            type: VisualizationTypes.AREA,
                        },
                    ],
                };
                const chartConfig = { [stackConfig]: true };
                const { series } = getStackMeasuresConfiguration(chartOptions, config, chartConfig);

                expect(series).toEqual([
                    {
                        yAxis: 0,
                        stack: 0,
                        stacking: stackType,
                        type: VisualizationTypes.COLUMN,
                        dataLabels: { style: WHITE_LABEL },
                    },
                    {
                        yAxis: 1,
                        stack: null,
                        stacking: null,
                        type: VisualizationTypes.AREA,
                        dataLabels: { style: BLACK_LABEL },
                    },
                ]);
            });

            it("should return series with no stack config", () => {
                const chartOptions = {
                    type: VisualizationTypes.COMBO,
                    yAxes: [{}],
                };
                const config = {
                    yAxis: [{}],
                    series: [
                        {
                            yAxis: 0,
                            type: VisualizationTypes.COLUMN,
                        },
                        {
                            yAxis: 0,
                            type: VisualizationTypes.LINE,
                        },
                    ],
                };
                const chartConfig = { stackMeasuresToPercent: true };
                const { series } = getStackMeasuresConfiguration(chartOptions, config, chartConfig);

                expect(series).toEqual([
                    {
                        yAxis: 0,
                        type: VisualizationTypes.COLUMN,
                        dataLabels: { style: BLACK_LABEL },
                    },
                    {
                        yAxis: 0,
                        type: VisualizationTypes.LINE,
                        dataLabels: { style: BLACK_LABEL },
                    },
                ]);
            });

            it("should return series with 'normal' stack config", () => {
                const chartOptions = {
                    type: VisualizationTypes.COMBO,
                    yAxes: [{}],
                };
                const config = {
                    yAxis: [{}],
                    series: [
                        {
                            yAxis: 0,
                            type: VisualizationTypes.COLUMN,
                        },
                        {
                            yAxis: 0,
                            type: VisualizationTypes.LINE,
                        },
                    ],
                };
                const chartConfig = { stackMeasures: true, stackMeasuresToPercent: true };
                const { series } = getStackMeasuresConfiguration(chartOptions, config, chartConfig);

                expect(series).toEqual([
                    {
                        stack: 0,
                        stacking: NORMAL_STACK,
                        yAxis: 0,
                        type: VisualizationTypes.COLUMN,
                        dataLabels: { style: WHITE_LABEL },
                    },
                    {
                        stack: 0,
                        stacking: null,
                        yAxis: 0,
                        type: VisualizationTypes.LINE,
                        dataLabels: { style: BLACK_LABEL },
                    },
                ]);
            });
        });

        describe("getYAxisConfiguration", () => {
            it("should return empty config with not column chart type", () => {
                const chartOptions = { type: VisualizationTypes.BAR };
                const config = {};
                const chartConfig = {};

                const result = getYAxisConfiguration(chartOptions, config, chartConfig);
                expect(result).toEqual({});
            });

            it('should disable stack labels when "stackMeasuresToPercent" is on', () => {
                const chartOptions = { type: VisualizationTypes.COLUMN };
                const config = {
                    yAxis: [{}],
                    series: [
                        {
                            yAxis: 0,
                            data: [
                                {
                                    y: 100,
                                },
                                {
                                    y: -50,
                                },
                            ],
                        },
                    ],
                };
                const chartConfig = {
                    stackMeasuresToPercent: true,
                    dataLabels: { visible: true },
                };

                const result = getYAxisConfiguration(chartOptions, config, chartConfig);
                expect(result).toEqual({
                    yAxis: [
                        {
                            stackLabels: { enabled: false },
                        },
                    ],
                });
            });

            it("should disable stack labels only on left axis with dual chart", () => {
                const chartOptions = { type: VisualizationTypes.COLUMN };
                const config = {
                    yAxis: [{}, {}], // dual axis chart
                    series: [
                        {
                            yAxis: 0, // left measure
                            data: [
                                {
                                    y: 100,
                                },
                                {
                                    y: -50, // has negative value
                                },
                            ],
                        },
                        {
                            yAxis: 1, // right measure
                            data: [
                                {
                                    y: 100,
                                },
                                {
                                    y: 50,
                                },
                            ],
                        },
                    ],
                };
                const chartConfig = {
                    stackMeasuresToPercent: true,
                    dataLabels: { visible: true },
                };

                const result = getYAxisConfiguration(chartOptions, config, chartConfig);
                expect(result).toEqual({
                    yAxis: [
                        {
                            stackLabels: { enabled: false },
                        },
                        {
                            stackLabels: { enabled: true },
                        },
                    ],
                });
            });
        });
    });

    describe("getSanitizedStackingForSeries", () => {
        it.each([
            ["primary axis", 0],
            ["secondary axis", 1],
        ])("should return the same series if series belong to %s", (_axisName: string, axisIndex: number) => {
            const series: ISeriesItem[] = [{ yAxis: axisIndex }];
            const result = getSanitizedStackingForSeries(series);
            expect(result).toEqual(series);
        });
        it.each([[PERCENT_STACK], [NORMAL_STACK]])(
            "should return the sanitized series if secondary axis has %s stack",
            (stacking: null | string) => {
                const series: ISeriesItem[] = [{ yAxis: 0 }, { yAxis: 1, stacking }];
                const result = getSanitizedStackingForSeries(series);
                expect(result).toEqual([
                    // stack + stacking on primary Y axis is keep as is
                    {
                        yAxis: 0,
                    },
                    {
                        yAxis: 1,
                        // stack is resetted for secondary Y axis
                        stack: null,
                        // stacking on secondary Y axis is resetted when stackMeasuresToPercent is true
                        stacking: NORMAL_STACK,
                    },
                ]);
            },
        );
    });

    describe("getShowInPercentConfiguration", () => {
        it('should not add formatter when "stackMeasuresToPercent" is false', () => {
            const chartConfig = {
                stackMeasuresToPercent: false,
            };
            const result = getShowInPercentConfiguration(undefined, undefined, chartConfig);
            expect(result).toEqual({});
        });

        it('should add formatter when "stackMeasuresToPercent" is true and one measure', () => {
            const chartOptions = {
                yAxes: [{}],
                data: {
                    series: [{ yAxis: 0 }],
                },
            };
            const chartConfig = {
                stackMeasuresToPercent: true,
            };
            const result: any = getShowInPercentConfiguration(chartOptions, undefined, chartConfig);
            expect(result.yAxis[0]).toHaveProperty("labels.formatter");
        });

        it('should add formatter when "stackMeasuresToPercent" is true and two measures', () => {
            const chartOptions = {
                yAxes: [{}],
                data: {
                    series: Array(2).fill({ yAxis: 0 }),
                },
            };
            const chartConfig = {
                stackMeasuresToPercent: true,
            };
            const result: any = getShowInPercentConfiguration(chartOptions, undefined, chartConfig);
            expect(result.yAxis[0]).toHaveProperty("labels.formatter");
        });

        it("should NOT add formatter for secondary y-axis in combo chart", () => {
            const chartOptions = {
                type: VisualizationTypes.COMBO,
                yAxes: [{ opposite: false }, { opposite: true }],
                data: {
                    series: Array(2).fill({ yAxis: 0 }),
                },
            };
            const chartConfig = {
                stackMeasuresToPercent: true,
            };

            const result: any = getShowInPercentConfiguration(chartOptions, undefined, chartConfig);
            expect(result.yAxis[0]).toHaveProperty("labels.formatter");
            expect(result.yAxis[1]).toEqual({});
        });

        it("should NOT add formatter when primary y-axis is line chart type in combo chart", () => {
            const chartOptions: IChartOptions = {
                type: VisualizationTypes.COMBO,
                yAxes: [{ opposite: false }],
                data: {
                    series: Array(2).fill({ yAxis: 0 }),
                },
            };
            const chartConfig: IChartConfig = {
                stackMeasuresToPercent: true,
                primaryChartType: VisualizationTypes.LINE,
            };

            const result = getShowInPercentConfiguration(chartOptions, undefined, chartConfig);
            expect(result).toEqual({});
        });
    });

    describe("convertMinMaxFromPercentToNumber", () => {
        it("should not convert min/max to percent", () => {
            const chartConfig = {
                stackMeasuresToPercent: false,
            };
            const result = convertMinMaxFromPercentToNumber(undefined, undefined, chartConfig);
            expect(result).toEqual({});
        });

        it.each([
            [
                "left Y axis for single axis chart",
                {
                    yAxis: [
                        {
                            min: 0.1,
                            max: 0.9,
                            opposite: false,
                        },
                    ],
                },
                {
                    yAxis: [
                        {
                            min: 10,
                            max: 90,
                        },
                    ],
                },
            ],
            [
                "right Y axis for single axis chart",
                {
                    yAxis: [
                        {
                            min: 0.1,
                            max: 0.9,
                            opposite: true,
                        },
                    ],
                },
                {
                    yAxis: [
                        {
                            min: 10,
                            max: 90,
                        },
                    ],
                },
            ],
            [
                "primary Y axis for dual axis chart",
                {
                    yAxis: [
                        {
                            min: 0.1,
                            max: 0.9,
                            opposite: false,
                        },
                        {
                            min: 1000,
                            max: 9000,
                            opposite: true,
                        },
                    ],
                },
                {
                    yAxis: [
                        {
                            min: 10,
                            max: 90,
                        },
                        {},
                    ],
                },
            ],
        ])("should convert min/max for %s", (_: string, config: any, expectedConfig: any) => {
            const result = convertMinMaxFromPercentToNumber(undefined, config, {
                stackMeasuresToPercent: true,
            });
            expect(result).toEqual(expectedConfig);
        });
    });
});
