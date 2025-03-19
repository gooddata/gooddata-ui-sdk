// (C) 2007-2024 GoodData Corporation
import React from "react";
import { BaseChart, IBaseChartProps } from "../_base/BaseChart.js";
import { ICoreChartProps } from "../../interfaces/index.js";

export class CoreScatterPlot extends React.PureComponent<ICoreChartProps, null> {
    public render() {
        const { config } = this.props;
        const clusteringConfig: Partial<IBaseChartProps> = config?.clustering
            ? { clusteringConfig: config.clustering }
            : {};
        return <BaseChart type="scatter" {...this.props} {...clusteringConfig} />;
    }
}
