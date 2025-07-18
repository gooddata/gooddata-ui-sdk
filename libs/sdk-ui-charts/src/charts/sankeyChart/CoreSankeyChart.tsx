// (C) 2007-2025 GoodData Corporation
import { memo } from "react";
import { ICoreChartProps } from "../../interfaces/index.js";
import { BaseChart } from "../_base/BaseChart.js";

export const CoreSankeyChart = memo(function CoreSankeyChart(props: ICoreChartProps) {
    return <BaseChart type="sankey" {...props} />;
});
