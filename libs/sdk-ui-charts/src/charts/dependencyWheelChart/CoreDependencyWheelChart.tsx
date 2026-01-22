// (C) 2023-2026 GoodData Corporation

import { memo } from "react";

import { type ICoreChartProps } from "../../interfaces/chartProps.js";
import { BaseChart } from "../_base/BaseChart.js";

export const CoreDependencyWheelChart = memo(function CoreDependencyWheelChart(props: ICoreChartProps) {
    return <BaseChart type="dependencywheel" {...props} />;
});
