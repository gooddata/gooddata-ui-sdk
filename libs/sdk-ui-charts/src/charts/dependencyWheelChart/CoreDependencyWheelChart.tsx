// (C) 2023 GoodData Corporation
import React from "react";
import { ICoreChartProps } from "../../interfaces";
import { BaseChart } from "../_base/BaseChart";

export class CoreDependencyWheelChart extends React.PureComponent<ICoreChartProps, null> {
    public render() {
        return <BaseChart type="dependencywheel" {...this.props} />;
    }
}
