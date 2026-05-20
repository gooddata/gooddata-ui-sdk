// (C) 2026 GoodData Corporation

import { memo } from "react";

import { type ICoreChartProps } from "../../interfaces/chartProps.js";
import { BaseChart } from "../_base/BaseChart.js";

export const CoreRadarChart = memo(function CoreRadarChart(props: ICoreChartProps) {
    return <BaseChart type="radar" {...props} />;
});
