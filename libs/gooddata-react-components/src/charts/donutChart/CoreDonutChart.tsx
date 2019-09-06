// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { IChartProps } from "../chartProps";
import { BaseChart } from "../../components/core/base/NewBaseChart";

export class CoreDonutChart extends React.PureComponent<IChartProps, null> {
    public render() {
        return <BaseChart type="donut" {...this.props} />;
    }
}
