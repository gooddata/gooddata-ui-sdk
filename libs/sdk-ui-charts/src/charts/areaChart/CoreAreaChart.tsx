// (C) 2007-2025 GoodData Corporation
import { memo } from "react";
import { BaseChart } from "../_base/BaseChart.js";
import { ICoreChartProps } from "../../interfaces/index.js";

export const CoreAreaChart = memo(function CoreAreaChart(props: ICoreChartProps) {
    return <BaseChart type="area" {...props} />;
});
