// (C) 2007-2022 GoodData Corporation
import { IExecutionDefinition, ITheme } from "@gooddata/sdk-model";
import { IChartOptions } from "../../typings/unsafe.js";
import { styleVariables } from "../_chartCreators/styles/variables.js";

export const LINE_WIDTH = 3;

export function getScatterConfiguration(
    _config: IChartOptions,
    _definition: IExecutionDefinition,
    theme: ITheme,
): any {
    return {
        chart: {
            type: "scatter",
        },
        plotOptions: {
            scatter: {
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
            },
        },
        xAxis: [
            {
                startOnTick: true,
            },
        ],
        series: {
            lineWidth: LINE_WIDTH,
            fillOpacity: 0.3,
            states: {
                hover: {
                    lineWidth: LINE_WIDTH + 1,
                },
            },
        },
        legend: {
            enabled: false,
        },
    };
}
