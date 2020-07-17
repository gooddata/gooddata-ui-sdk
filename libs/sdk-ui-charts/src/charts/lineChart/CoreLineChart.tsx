// (C) 2007-2018 GoodData Corporation
import React from "react";
import { BaseChart } from "../_base/BaseChart";
import { ICoreChartProps } from "../../interfaces";

export class CoreLineChart extends React.PureComponent<ICoreChartProps, null> {
    public render() {
        return <BaseChart type="line" {...this.props} />;
    }
}
