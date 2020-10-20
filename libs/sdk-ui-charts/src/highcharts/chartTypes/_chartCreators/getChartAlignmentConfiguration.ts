// (C) 2019-2020 GoodData Corporation
import { IChartConfig } from "../../../interfaces";
import { IChartOptions } from "../../typings/unsafe";

export function getChartAlignmentConfiguration(
    _chartOptions: IChartOptions,
    _config: unknown,
    chartConfig: IChartConfig = {},
): Partial<IChartConfig> {
    const { chart } = chartConfig;
    return { chart };
}
