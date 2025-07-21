// (C) 2023-2025 GoodData Corporation
import { PureComponent } from "react";
import { ICoreChartProps } from "../../interfaces/index.js";
import { BaseChart } from "../_base/BaseChart.js";

export class CoreDependencyWheelChart extends PureComponent<ICoreChartProps, null> {
    public render() {
        return <BaseChart type="dependencywheel" {...this.props} />;
    }
}
