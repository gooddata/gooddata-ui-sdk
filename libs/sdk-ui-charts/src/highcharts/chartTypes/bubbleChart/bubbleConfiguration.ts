// (C) 2007-2025 GoodData Corporation
import { IExecutionDefinition, ITheme } from "@gooddata/sdk-model";

import { HighchartsOptions, SeriesBubbleOptions } from "../../lib/index.js";
import { IChartOptions } from "../../typings/unsafe.js";
import { styleVariables } from "../_chartCreators/styles/variables.js";

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
            series: {
                marker: {
                    enabled: true,
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
            },
            bubble: {
                stickyTracking: false,
                dataLabels: {
                    enabled: false, // TODO remove once FF for config panel is removed
                    allowOverlap: false,
                },
                marker: {
                    radius: null,
                },
            },
        },
        xAxis: [
            {
                labels: {
                    distance: 7,
                },
                startOnTick: true,
            },
        ],
        series,
        legend: {
            enabled: false,
        },
    };
}
