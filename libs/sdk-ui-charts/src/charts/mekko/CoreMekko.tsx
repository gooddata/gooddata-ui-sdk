// (C) 2026 GoodData Corporation

import { memo } from "react";

import { type ICoreChartProps } from "../../interfaces/chartProps.js";
import { BaseChart } from "../_base/BaseChart.js";

export const CoreMekko = memo(function CoreMekko(props: ICoreChartProps) {
    return <BaseChart type="mekko" {...props} />;
});
