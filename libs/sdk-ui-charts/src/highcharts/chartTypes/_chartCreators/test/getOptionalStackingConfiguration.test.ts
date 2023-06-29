// (C) 2007-2022 GoodData Corporation
import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import Highcharts, { HighchartsOptions } from "../../../lib/index.js";
import getOptionalStackingConfiguration, {
    convertMinMaxFromPercentToNumber,
    getParentAttributeConfiguration,
    getSanitizedStackingForSeries,
    getShowInPercentConfiguration,
    getStackMeasuresConfiguration,
    getYAxisConfiguration,
    setDrillConfigToXAxis,
} from "../getOptionalStackingConfiguration.js";
import { IDrillConfig, VisualizationTypes } from "@gooddata/sdk-ui";
import { IChartConfig } from "../../../../interfaces/index.js";
import { BLACK_LABEL, WHITE_LABEL } from "../../../constants/label.js";
import { StackingType } from "../../../constants/stacking.js";
import { IChartOptions, ISeriesItem, IStackMeasuresConfig } from "../../../typings/unsafe.js";
import { describe, it, expect } from "vitest";

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
            ["normal" as StackingType, { stackMeasures: true }],
            ["percent" as StackingType, { stackMeasuresToPercent: true }],
        ])(
            "should return series config with %s stacking",
            (type: StackingType, chartConfig: IChartConfig) => {
                const chartOptions = { yAxes: [{ label: "" }] };
                const config = { series: Array(2).fill({ yAxis: 0 }) };

                const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
                expect(result).toEqual({
                    series: Array(2).fill({
                        yAxis: 0,
                        stack: 0,
                        stacking: type,
                    }),
                });
            },
        );

        it('should "stackMeasuresToPercent" always overwrite "stackMeasures" setting', () => {
            const chartOptions = { yAxes: [{ label: "" }] };
            const config = { series: Array(2).fill({ yAxis: 0 }) };
            const chartConfig = {
                stackMeasures: true,
                stackMeasuresToPercent: true,
            };

            const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
            expect(result).toEqual({
                series: Array<ISeriesItem>(2).fill({
                    yAxis: 0,
                    stack: 0,
                    stacking: "percent",
                }),
            });
        });

        it("should return series with stacking config with normal stacking for dual axis", () => {
            const chartOptions = {
                type: VisualizationTypes.COLUMN,
                yAxes: [{ label: "" }, { label: "" }],
            };
            const config = {
                yAxis: [
                    {
                        title: {
                            text: "",
                        },
                    },
                    {
                        title: {
                            text: "",
                        },
                    },
                ],
                series: [...Array(2).fill({ yAxis: 0 }), ...Array(2).fill({ yAxis: 1 })],
            };
            const chartConfig = { stackMeasures: true };

            const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
            const expectedConfiguration: IStackMeasuresConfig = {
                series: [
                    ...Array<ISeriesItem>(2).fill({
                        yAxis: 0, // primary Y axis
                        stack: 0,
                        stacking: "normal",
                    }),
                    ...Array<ISeriesItem>(2).fill({
                        yAxis: 1, // secondary Y axis
                        // stack is reset for secondary Y axis
                        stack: null,
                        // stacking on secondary Y axis is reset when stackMeasures is false
                        stacking: "normal",
                    }),
                ],
                yAxis: Array(2).fill({
                    title: {
                        text: "",
                    },
                    stackLabels: { enabled: true },
                }),
            };
            expect(result).toEqual(expectedConfiguration);
        });

        it('should return series without "stackMeasuresToPercent" config for measure on right axis of dual axis', () => {
            const chartOptions = {
                type: VisualizationTypes.COLUMN,
                yAxes: [{ label: "" }, { label: "" }],
            };
            const config: HighchartsOptions = {
                yAxis: [{}, {}],
                series: [
                    {
                        type: "column",
                        yAxis: 0,
                    },
                    {
                        type: "column",
                        yAxis: 1,
                    },
                ],
            };
            const chartConfig = { stackMeasuresToPercent: true };

            const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
            const expectedConfiguration: IStackMeasuresConfig = {
                series: [
                    {
                        type: "column",
                        yAxis: 0, // primary Y axis
                        // stack + stacking on primary Y axis is keep as is
                        stack: 0,
                        stacking: "percent",
                    },
                    {
                        type: "column",
                        yAxis: 1, // secondary Y axis
                        // stack is resetted for secondary Y axis
                        stack: null,
                        // stacking on secondary Y axis is resetted to "normal"
                        stacking: "normal",
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
            };
            expect(result).toEqual(expectedConfiguration);
        });

        it('should return series with "stackMeasures" config with one measure in each axis for dual axis', () => {
            const chartOptions = {
                type: VisualizationTypes.COLUMN,
                yAxes: [{ label: "" }, { label: "" }],
            };
            const config: HighchartsOptions = {
                yAxis: [{}, {}],
                series: [
                    {
                        type: "column",
                        yAxis: 0,
                    },
                    {
                        type: "column",
                        yAxis: 1,
                    },
                ],
            };
            const chartConfig = { stackMeasures: true };

            const result = getStackMeasuresConfiguration(chartOptions, config, chartConfig);
            const expectedConfiguration: IStackMeasuresConfig = {
                series: [
                    {
                        type: "column",
                        yAxis: 0, // primary Y axis
                        // stack + stacking on primary Y axis is keep as is
                        stack: 0,
                        stacking: "normal",
                    },
                    {
                        type: "column",
                        yAxis: 1, // secondary Y axis
                        // stack is resetted for secondary Y axis
                        stack: null,
                        // stacking on secondary Y axis is resetted when stackMeasuresToPercent is true
                        stacking: "normal",
                    },
                ],
                yAxis: Array(2).fill({
                    stackLabels: { enabled: true },
                }),
            };
            expect(result).toEqual(expectedConfiguration);
        });

        it.each([
            ["", true, true],
            ["", "auto", true],
            ["", false, false],
        ])(
            'should%s show stack label when "dataLabel.visible" is %s',
            (_negation: string, totalsVisible: boolean | string, stackingResult: boolean | string) => {
                const chartOptions = {
                    type: VisualizationTypes.COLUMN,
                    yAxes: [{ label: "" }],
                };
                const config: HighchartsOptions = {
                    series: [{ type: "column", yAxis: 0 }],
                    yAxis: [{}],
                };
                const chartConfig = {
                    stackMeasures: true,
                    dataLabels: { totalsVisible },
                };
                const { yAxis }: any = getStackMeasuresConfiguration(chartOptions, config, chartConfig);

                expect(yAxis).toEqual(
                    Array(1).fill({
                        stackLabels: { enabled: Boolean(stackingResult) },
                    }),
                );
            },
        );

        it('should not return "yAxis.stackLabels" to bar chart by default', () => {
            // the template in 'barConfiguration.ts' turns stackLabels off by default
            const chartOptions = {
                type: VisualizationTypes.BAR,
                yAxes: [{ label: "" }],
            };
            const config: HighchartsOptions = {
                series: [{ type: "bar", yAxis: 0 }],
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
                yAxes: [
                    { label: "", opposite: false },
                    { label: "", opposite: true },
                ],
            };

            it.each<
                [stackConfig: string, type: string, stackType: StackingType, labelStyle: Highcharts.CSSObject]
            >([
                ["stackMeasures", VisualizationTypes.COLUMN, "normal", WHITE_LABEL],
                ["stackMeasures", VisualizationTypes.AREA, "normal", BLACK_LABEL],
                ["stackMeasuresToPercent", VisualizationTypes.COLUMN, "percent", WHITE_LABEL],
                ["stackMeasuresToPercent", VisualizationTypes.AREA, "percent", BLACK_LABEL],
            ])(
                "should return series with %s config if series type is %s",
                (stackConfig, type, stackType, labelStyle) => {
                    const config: HighchartsOptions = {
                        yAxis: [{}, {}],
                        series: [
                            {
                                yAxis: 0,
                                type: type as any,
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

            it.each<[stackConfig: string, stackType: StackingType]>([
                ["stackMeasures", "normal"],
                ["stackMeasuresToPercent", "percent"],
            ])("should NOT apply %s on secondary y-axis", (stackConfig, stackType) => {
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
                const chartOptions: IChartOptions = {
                    type: VisualizationTypes.COMBO,
                    yAxes: [{ label: "" }],
                    data: {
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
                    },
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
                    yAxes: [{ label: "" }],
                    data: {
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
                    },
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
                const expectedSeries: IStackMeasuresConfig["series"] = [
                    {
                        stack: 0,
                        stacking: "normal",
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
                ];

                expect(series).toEqual(expectedSeries);
            });
        });

        describe("getYAxisConfiguration", () => {
            it("should return empty config when not bar or column chart type", () => {
                const chartOptions = { type: VisualizationTypes.AREA };
                const config = {};
                const chartConfig = {};

                const result = getYAxisConfiguration(chartOptions, config, chartConfig);
                expect(result).toEqual({});
            });

            it('should disable stack labels when "stackMeasuresToPercent" is on', () => {
                const chartOptions = { type: VisualizationTypes.COLUMN };
                const config: HighchartsOptions = {
                    yAxis: [{}],
                    series: [
                        {
                            type: "column",
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
                const config: HighchartsOptions = {
                    yAxis: [{}, {}], // dual axis chart
                    series: [
                        {
                            type: "column",
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
                            type: "column",
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
        it.each<[StackingType]>([["percent"], ["normal"]])(
            "should return the sanitized series if secondary axis has %s stack",
            (stacking: null | StackingType) => {
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
                        stacking: "normal",
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
            const result = getShowInPercentConfiguration(undefined, chartConfig, undefined);
            expect(result).toEqual({});
        });

        it('should add formatter when "stackMeasuresToPercent" is true and one measure', () => {
            const chartOptions = {
                yAxes: [{ label: "" }],
                data: {
                    series: [{ yAxis: 0 }],
                },
            };
            const chartConfig = {
                stackMeasuresToPercent: true,
            };
            const result: any = getShowInPercentConfiguration(chartOptions, chartConfig, undefined);
            expect(result.yAxis[0]).toHaveProperty("labels.formatter");
        });

        it('should add formatter when "stackMeasuresToPercent" is true and two measures', () => {
            const chartOptions = {
                yAxes: [{ label: "" }],
                data: {
                    series: Array(2).fill({ yAxis: 0 }),
                },
            };
            const chartConfig = {
                stackMeasuresToPercent: true,
            };
            const result: any = getShowInPercentConfiguration(chartOptions, chartConfig, undefined);
            expect(result.yAxis[0]).toHaveProperty("labels.formatter");
        });

        it("should NOT add formatter for secondary y-axis in combo chart", () => {
            const chartOptions = {
                type: VisualizationTypes.COMBO,
                yAxes: [
                    { label: "", opposite: false },
                    { label: "", opposite: true },
                ],
                data: {
                    series: Array(2).fill({ yAxis: 0 }),
                },
            };
            const chartConfig = {
                stackMeasuresToPercent: true,
            };

            const result: any = getShowInPercentConfiguration(chartOptions, chartConfig, undefined);
            expect(result.yAxis[0]).toHaveProperty("labels.formatter");
            expect(result.yAxis[1]).toEqual({});
        });

        it("should NOT add formatter when primary y-axis is line chart type in combo chart", () => {
            const chartOptions: IChartOptions = {
                type: VisualizationTypes.COMBO,
                yAxes: [{ label: "", opposite: false }],
                data: {
                    series: Array(2).fill({ yAxis: 0 }),
                },
            };
            const chartConfig: IChartConfig = {
                stackMeasuresToPercent: true,
                primaryChartType: VisualizationTypes.LINE,
            };

            const result = getShowInPercentConfiguration(chartOptions, chartConfig, undefined);
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
