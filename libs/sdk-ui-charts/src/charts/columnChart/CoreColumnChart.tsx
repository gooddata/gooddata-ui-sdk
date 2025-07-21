// (C) 2007-2025 GoodData Corporation
import { PureComponent } from "react";
import { BaseChart } from "../_base/BaseChart.js";
import { ICoreChartProps } from "../../interfaces/index.js";

export class CoreColumnChart extends PureComponent<ICoreChartProps> {
    public render() {
        return <BaseChart type="column" {...this.props} />;
    }
}
