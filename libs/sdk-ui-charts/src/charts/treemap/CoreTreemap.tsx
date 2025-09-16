// (C) 2007-2025 GoodData Corporation

import { memo } from "react";

import { ICoreChartProps } from "../../interfaces/index.js";
import { BaseChart } from "../_base/BaseChart.js";

export const CoreTreemap = memo(function CoreTreemap(props: ICoreChartProps) {
    return <BaseChart type="treemap" {...props} />;
});
