// (C) 2007-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { IChartOptions } from "../../typings/unsafe";
import { ITheme } from "@gooddata/sdk-backend-spi";
import { styleVariables } from "../_chartCreators/styles/variables";

export const LINE_WIDTH = 3;

const SCATTER_TEMPLATE = {
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
                        lineColor: styleVariables.gdColorBackground,
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

export function getScatterConfiguration(
    _config: IChartOptions,
    _definition: IExecutionDefinition,
    theme: ITheme,
): typeof SCATTER_TEMPLATE {
    const config = cloneDeep(SCATTER_TEMPLATE);
    config.plotOptions.scatter.marker.states.hover.lineColor =
        theme?.chart?.backgroundColor?.base || styleVariables.gdColorBackground;
    return config;
}
