// (C) 2007-2026 GoodData Corporation

import { memo } from "react";

import { type ICoreChartProps } from "../../interfaces/chartProps.js";
import { BaseChart } from "../_base/BaseChart.js";

export const CoreFunnelChart = memo(function CoreFunnelChart(props: ICoreChartProps) {
    return <BaseChart type="funnel" {...props} />;
});
