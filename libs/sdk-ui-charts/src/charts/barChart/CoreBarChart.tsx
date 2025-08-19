// (C) 2007-2025 GoodData Corporation
import React, { memo } from "react";

import { ICoreChartProps } from "../../interfaces/index.js";
import { BaseChart } from "../_base/BaseChart.js";

export const CoreBarChart = memo(function CoreBarChart(props: ICoreChartProps) {
    return <BaseChart type="bar" {...props} />;
});
