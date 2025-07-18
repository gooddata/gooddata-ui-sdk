// (C) 2007-2025 GoodData Corporation
import { memo } from "react";
import { BaseChart } from "../_base/BaseChart.js";
import { ICoreChartProps } from "../../interfaces/index.js";

export const CoreHeatmap = memo(function CoreHeatmap(props: ICoreChartProps) {
    return <BaseChart type="heatmap" {...props} />;
});
