// (C) 2007-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { IChartOptions } from "../../typings/unsafe";
import { ITheme } from "@gooddata/sdk-backend-spi";
import { styleVariables } from "../_chartCreators/styles/variables";

const BUBBLE_TEMPLATE = {
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

export function getBubbleConfiguration(
    _config: IChartOptions,
    _definition: IExecutionDefinition,
    theme: ITheme,
): typeof BUBBLE_TEMPLATE {
    const config = cloneDeep(BUBBLE_TEMPLATE);
    config.plotOptions.bubble.marker.states.hover.lineColor =
        theme?.chart?.backgroundColor?.base || styleVariables.gdColorBackground;
    return config;
}
