// (C) 2007-2022 GoodData Corporation
import { IExecutionDefinition, ITheme } from "@gooddata/sdk-model";
import { IChartOptions } from "../../typings/unsafe.js";
import { styleVariables } from "../_chartCreators/styles/variables.js";
import { HighchartsOptions, SeriesAreaOptions } from "../../lib/index.js";

const LINE_WIDTH = 3;

export function getAreaConfiguration(
    _config: IChartOptions,
    _definition: IExecutionDefinition,
    theme: ITheme,
): HighchartsOptions {
    const series: SeriesAreaOptions = {
        type: "area",
        marker: {
            symbol: "circle",
            radius: 4.5,
            lineColor:
                theme?.chart?.backgroundColor ??
                theme?.palette?.complementary?.c0 ??
                styleVariables.gdColorBackground,
        },
        lineWidth: LINE_WIDTH,
        fillOpacity: 0.6,
        states: {
            hover: {
                lineWidth: LINE_WIDTH + 1,
            },
        },
    };
    return {
        chart: {
            type: "area",
        },
        plotOptions: {
            area: {
                lineWidth: LINE_WIDTH,
            },
            series,
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
}
