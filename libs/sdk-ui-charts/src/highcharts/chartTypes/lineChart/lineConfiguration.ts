// (C) 2007-2021 GoodData Corporation
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { IChartOptions } from "../../typings/unsafe";
import { ITheme } from "@gooddata/sdk-backend-spi";
import { styleVariables } from "../_chartCreators/styles/variables";

export const LINE_WIDTH = 3;

export function getLineConfiguration(
    _config: IChartOptions,
    _definition: IExecutionDefinition,
    theme: ITheme,
) {
    return {
        chart: {
            type: "line",
        },
        plotOptions: {
            series: {
                marker: {
                    symbol: "circle",
                    radius: 4.5,
                    lineColor:
                        theme?.chart?.backgroundColor ??
                        theme?.palette?.complementary?.c0 ??
                        styleVariables.gdColorBackground,
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
}
