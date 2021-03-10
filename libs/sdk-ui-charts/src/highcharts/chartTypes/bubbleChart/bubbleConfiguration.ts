// (C) 2007-2021 GoodData Corporation
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { IChartOptions } from "../../typings/unsafe";
import { ITheme } from "@gooddata/sdk-backend-spi";
import { styleVariables } from "../_chartCreators/styles/variables";

export function getBubbleConfiguration(
    _config: IChartOptions,
    _definition: IExecutionDefinition,
    theme: ITheme,
) {
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
                states: {
                    hover: {
                        marker: {
                            enabled: false,
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
        series: {
            states: {
                hover: {
                    enabled: false,
                },
            },
        },
        legend: {
            enabled: false,
        },
    };
}
