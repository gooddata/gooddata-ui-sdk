// (C) 2007-2026 GoodData Corporation

import { type ICoreChartProps } from "../../interfaces/chartProps.js";
import { BaseChart } from "../_base/BaseChart.js";

export function CoreBubbleChart(props: ICoreChartProps) {
    return <BaseChart type="bubble" {...props} />;
}
