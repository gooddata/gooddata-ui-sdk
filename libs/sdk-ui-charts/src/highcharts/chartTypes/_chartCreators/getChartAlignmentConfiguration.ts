// (C) 2019-2026 GoodData Corporation

import { type IChartConfig } from "../../../interfaces/chartConfig.js";
import { type IChartOptions } from "../../typings/unsafe.js";

export function getChartAlignmentConfiguration(
    _chartOptions: IChartOptions,
    _config: unknown,
    chartConfig: IChartConfig = {},
): Partial<IChartConfig> {
    const { chart } = chartConfig;
    return { chart };
}
