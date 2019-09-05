// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { BaseChart } from "./base/NewBaseChart";
import { IChartProps } from "../exp/props";

export class BarChart extends React.PureComponent<IChartProps, null> {
    public render() {
        return <BaseChart type="bar" {...this.props} />;
    }
}
