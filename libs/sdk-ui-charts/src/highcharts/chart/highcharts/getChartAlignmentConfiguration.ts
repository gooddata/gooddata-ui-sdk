// (C) 2019 GoodData Corporation
import { IChartConfig, IChartOptions } from "../../Config";

export function getChartAlignmentConfiguration(
    _chartOptions: IChartOptions,
    _config: any,
    chartConfig: IChartConfig = {},
): Partial<IChartConfig> {
    const { chart } = chartConfig;
    return { chart };
}
