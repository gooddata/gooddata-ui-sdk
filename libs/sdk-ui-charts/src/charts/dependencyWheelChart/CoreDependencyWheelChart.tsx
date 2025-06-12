// (C) 2023 GoodData Corporation
import React from "react";
import { ICoreChartProps } from "../../interfaces/index.js";
import { BaseChart } from "../_base/BaseChart.js";

export class CoreDependencyWheelChart extends React.PureComponent<ICoreChartProps, null> {
    public render() {
        return <BaseChart type="dependencywheel" {...this.props} />;
    }
}
