// (C) 2007-2025 GoodData Corporation
import { PureComponent } from "react";
import { ICoreChartProps } from "../../interfaces/index.js";
import { BaseChart } from "../_base/BaseChart.js";

export class CoreSankeyChart extends PureComponent<ICoreChartProps, null> {
    public render() {
        return <BaseChart type="sankey" {...this.props} />;
    }
}
