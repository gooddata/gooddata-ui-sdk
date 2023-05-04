// (C) 2023 GoodData Corporation
import { IChartConfig } from "../../../interfaces";
import { IChartOptions } from "../../typings/unsafe";
import { HighchartsOptions } from "../../lib";

export function getContinuousLineConfiguration(
    _chartOptions: IChartOptions,
    _config: HighchartsOptions,
    chartConfig?: IChartConfig,
) {
    const isContinuousLineEnabled = chartConfig?.continuousLine?.enabled ?? false;
    if (!isContinuousLineEnabled) {
        return {};
    }

    return {
        plotOptions: {
            series: {
                connectNulls: isContinuousLineEnabled,
            },
        },
    };
}
