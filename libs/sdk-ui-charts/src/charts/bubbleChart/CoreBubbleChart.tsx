// (C) 2007-2018 GoodData Corporation
import React from "react";
import { ICoreChartProps } from "../../interfaces";
import { BaseChart } from "../_base/BaseChart";

export class CoreBubbleChart extends React.Component<ICoreChartProps, null> {
    public render() {
        return <BaseChart type="bubble" {...this.props} />;
    }
}
