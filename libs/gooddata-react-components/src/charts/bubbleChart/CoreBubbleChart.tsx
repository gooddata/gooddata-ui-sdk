// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { IChartProps } from "../chartProps";
import { BaseChart } from "../_base/BaseChart";

export class CoreBubbleChart extends React.Component<IChartProps, null> {
    public render() {
        return <BaseChart type="bubble" {...this.props} />;
    }
}
