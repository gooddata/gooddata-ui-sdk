// (C) 2007-2025 GoodData Corporation
import { PureComponent } from "react";
import { BaseChart } from "../_base/BaseChart.js";
import { ICoreChartProps } from "../../interfaces/index.js";

export class CoreTreemap extends PureComponent<ICoreChartProps, null> {
    public render() {
        return <BaseChart type="treemap" {...this.props} />;
    }
}
