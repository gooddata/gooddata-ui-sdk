// (C) 2007-2026 GoodData Corporation

import { memo } from "react";

import { type ICoreChartProps } from "../../interfaces/chartProps.js";
import { BaseChart, type IBaseChartProps } from "../_base/BaseChart.js";

export const CoreScatterPlot = memo(function CoreScatterPlot(props: ICoreChartProps) {
    const { config } = props;
    const clusteringConfig: Partial<IBaseChartProps> = config?.clustering
        ? { clusteringConfig: config.clustering }
        : {};
    return <BaseChart type="scatter" {...props} {...clusteringConfig} />;
});
