// (C) 2007-2025 GoodData Corporation
import React, { memo } from "react";
import { BaseChart } from "../_base/BaseChart.js";
import { ICoreChartProps } from "../../interfaces/index.js";

export const CoreTreemap = memo(function CoreTreemap(props: ICoreChartProps) {
    return <BaseChart type="treemap" {...props} />;
});
