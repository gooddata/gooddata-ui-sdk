// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { IChartProps } from "../../components/exp/props";
import { BaseChart } from "../../components/core/base/NewBaseChart";

export class CoreBubbleChart extends React.Component<IChartProps, null> {
    public render() {
        return <BaseChart type="bubble" {...this.props} />;
    }
}
