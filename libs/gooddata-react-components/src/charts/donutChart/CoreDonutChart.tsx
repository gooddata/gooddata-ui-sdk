// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { IChartProps } from "../chartProps";
import { BaseChart } from "../_base/BaseChart";

export class CoreDonutChart extends React.PureComponent<IChartProps, null> {
    public render() {
        return <BaseChart type="donut" {...this.props} />;
    }
}
