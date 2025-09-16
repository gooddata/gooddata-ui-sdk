// (C) 2007-2025 GoodData Corporation

import { ICoreChartProps } from "../../interfaces/index.js";
import { BaseChart } from "../_base/BaseChart.js";

export function CoreBubbleChart(props: ICoreChartProps) {
    return <BaseChart type="bubble" {...props} />;
}
