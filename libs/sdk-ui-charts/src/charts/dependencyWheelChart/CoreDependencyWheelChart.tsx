// (C) 2023-2025 GoodData Corporation

import { memo } from "react";

import { ICoreChartProps } from "../../interfaces/index.js";
import { BaseChart } from "../_base/BaseChart.js";

export const CoreDependencyWheelChart = memo(function CoreDependencyWheelChart(props: ICoreChartProps) {
    return <BaseChart type="dependencywheel" {...props} />;
});
