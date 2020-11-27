// (C) 2007-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { IChartOptions } from "../../typings/unsafe";
import { ITheme } from "@gooddata/sdk-backend-spi";
import { styleVariables } from "../_chartCreators/styles/variables";

export const LINE_WIDTH = 3;

const LINE_TEMPLATE = {
    chart: {
        type: "line",
    },
    plotOptions: {
        series: {
            marker: {
                symbol: "circle",
                radius: 4.5,
                lineColor: styleVariables.gdColorBackground,
            },
            lineWidth: LINE_WIDTH,
            fillOpacity: 0.3,
            states: {
                hover: {
                    lineWidth: LINE_WIDTH + 1,
                },
                inactive: {
                    opacity: 1,
                },
            },
        },
        column: {
            dataLabels: {},
        },
    },
    xAxis: [
        {
            categories: [] as string[],
        },
    ],
    yAxis: [
        {
            stackLabels: {
                enabled: false,
            },
        },
    ],
};

export function getLineConfiguration(
    _config: IChartOptions,
    _definition: IExecutionDefinition,
    theme: ITheme,
): typeof LINE_TEMPLATE {
    const config = cloneDeep(LINE_TEMPLATE);
    config.plotOptions.series.marker.lineColor =
        theme?.chart?.backgroundColor?.base || styleVariables.gdColorBackground;
    return config;
}
