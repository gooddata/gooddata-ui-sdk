// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { ICoreChartProps } from "../chartProps";
import { BaseChart } from "../_base/BaseChart";

export class CoreDonutChart extends React.PureComponent<ICoreChartProps, null> {
    public render() {
        return <BaseChart type="donut" {...this.props} />;
    }
}
