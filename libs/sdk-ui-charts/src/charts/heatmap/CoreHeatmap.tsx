// (C) 2007-2025 GoodData Corporation
import { PureComponent } from "react";
import { BaseChart } from "../_base/BaseChart.js";
import { ICoreChartProps } from "../../interfaces/index.js";

export class CoreHeatmap extends PureComponent<ICoreChartProps, null> {
    public render() {
        return <BaseChart type="heatmap" {...this.props} />;
    }
}
