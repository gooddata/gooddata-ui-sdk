// (C) 2007-2025 GoodData Corporation
import React, { memo } from "react";
import { BaseChart } from "../_base/BaseChart.js";
import { ICoreChartProps } from "../../interfaces/index.js";

export const CorePyramidChart = memo(function CorePyramidChart(props: ICoreChartProps) {
    return <BaseChart type="pyramid" {...props} />;
});
