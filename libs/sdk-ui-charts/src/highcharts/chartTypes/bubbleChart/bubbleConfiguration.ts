// (C) 2007-2022 GoodData Corporation
import { IExecutionDefinition, ITheme } from "@gooddata/sdk-model";
import { IChartOptions } from "../../typings/unsafe.js";
import { styleVariables } from "../_chartCreators/styles/variables.js";
import { HighchartsOptions, SeriesBubbleOptions } from "../../lib/index.js";

export function getBubbleConfiguration(
    _config: IChartOptions,
    _definition: IExecutionDefinition,
    theme: ITheme,
): HighchartsOptions {
    const series: SeriesBubbleOptions[] = [
        {
            type: "bubble",
            states: {
                hover: {
                    enabled: false,
                },
            },
        },
    ];
    return {
        chart: {
            type: "bubble",
        },
        plotOptions: {
            bubble: {
                stickyTracking: false,
                marker: {
                    symbol: "circle",
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor:
                                theme?.chart?.backgroundColor ??
                                theme?.palette?.complementary?.c0 ??
                                styleVariables.gdColorBackground,
                        },
                    },
                },
                dataLabels: {
                    enabled: false, // TODO remove once FF for config panel is removed
                    allowOverlap: false,
                },
            },
        },
        xAxis: [
            {
                startOnTick: true,
            },
        ],
        series,
        legend: {
            enabled: false,
        },
    };
}
