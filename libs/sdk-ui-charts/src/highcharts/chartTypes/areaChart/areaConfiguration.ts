// (C) 2007-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { IChartOptions } from "../../typings/unsafe";
import { ITheme } from "@gooddata/sdk-backend-spi";
import { styleVariables } from "../_chartCreators/styles/variables";

const LINE_WIDTH = 3;

const AREA_TEMPLATE = {
    chart: {
        type: "area",
    },
    plotOptions: {
        area: {
            lineWidth: 1,
        },
        series: {
            marker: {
                symbol: "circle",
                radius: 4.5,
                lineColor: styleVariables.gdColorBackground,
            },
            lineWidth: LINE_WIDTH,
            fillOpacity: 0.6,
            states: {
                hover: {
                    lineWidth: LINE_WIDTH + 1,
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

export function getAreaConfiguration(
    _config: IChartOptions,
    _definition: IExecutionDefinition,
    theme: ITheme,
): typeof AREA_TEMPLATE {
    const config = cloneDeep(AREA_TEMPLATE);
    config.plotOptions.series.marker.lineColor =
        theme?.chart?.backgroundColor?.base || styleVariables.gdColorBackground;
    return config;
}
