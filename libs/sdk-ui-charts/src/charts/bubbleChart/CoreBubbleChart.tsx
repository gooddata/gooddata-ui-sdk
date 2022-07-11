// (C) 2007-2022 GoodData Corporation
import React from "react";
import { ICoreChartProps } from "../../interfaces";
import { BaseChart } from "../_base/BaseChart";

export class CoreBubbleChart extends React.Component<ICoreChartProps> {
    public render() {
        return <BaseChart type="bubble" {...this.props} />;
    }
}
