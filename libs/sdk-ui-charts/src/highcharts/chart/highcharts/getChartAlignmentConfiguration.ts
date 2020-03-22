// (C) 2019-2020 GoodData Corporation
import { IChartOptions } from "../../Config";
import { IChartConfig } from "../../../interfaces";

export function getChartAlignmentConfiguration(
    _chartOptions: IChartOptions,
    _config: any,
    chartConfig: IChartConfig = {},
): Partial<IChartConfig> {
    const { chart } = chartConfig;
    return { chart };
}
