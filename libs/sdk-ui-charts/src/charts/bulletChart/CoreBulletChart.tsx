// (C) 2007-2025 GoodData Corporation
import { memo } from "react";
import { BaseChart } from "../_base/BaseChart.js";
import { ICoreChartProps } from "../../interfaces/index.js";

export const CoreBulletChart = memo(function CoreBulletChart(props: ICoreChartProps) {
    return <BaseChart type="bullet" {...props} />;
});
