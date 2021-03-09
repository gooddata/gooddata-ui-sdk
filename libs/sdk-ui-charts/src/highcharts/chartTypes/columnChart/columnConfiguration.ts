// (C) 2007-2021 GoodData Corporation
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { IChartOptions } from "../../typings/unsafe";
import { ITheme } from "@gooddata/sdk-backend-spi";

import { MAX_POINT_WIDTH } from "../_chartCreators/commonConfiguration";

export function getColumnConfiguration(
    _config: IChartOptions,
    _definition: IExecutionDefinition,
    theme: ITheme,
): any {
    return {
        chart: {
            type: "column",
            spacingTop: 20,
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true,
                    padding: 2,
                },
                maxPointWidth: MAX_POINT_WIDTH,
            },
            series: {
                states: {
                    hover: {
                        enabled: false,
                    },
                },
            },
        },
        yAxis: [
            {
                stackLabels: {
                    enabled: true,
                    allowOverlap: false,
                    ...(theme?.palette?.complementary && {
                        style: {
                            color: theme?.palette?.complementary?.shade9,
                            textOutline: "none",
                        },
                    }),
                },
            },
        ],
    };
}
