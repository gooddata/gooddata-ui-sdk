// (C) 2007-2025 GoodData Corporation

import { memo } from "react";

import { ICoreChartProps } from "../../interfaces/index.js";
import { BaseChart, IBaseChartProps } from "../_base/BaseChart.js";

export const CoreScatterPlot = memo(function CoreScatterPlot(props: ICoreChartProps) {
    const { config } = props;
    const clusteringConfig: Partial<IBaseChartProps> = config?.clustering
        ? { clusteringConfig: config.clustering }
        : {};
    return <BaseChart type="scatter" {...props} {...clusteringConfig} />;
});
