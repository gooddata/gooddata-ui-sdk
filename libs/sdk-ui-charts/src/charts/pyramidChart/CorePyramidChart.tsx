// (C) 2007-2023 GoodData Corporation
import React from "react";
import { BaseChart } from "../_base/BaseChart.js";
import { ICoreChartProps } from "../../interfaces/index.js";

export class CorePyramidChart extends React.PureComponent<ICoreChartProps> {
    public render() {
        return <BaseChart type="pyramid" {...this.props} />;
    }
}
