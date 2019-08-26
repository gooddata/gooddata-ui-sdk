// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { BaseChart, IChartProps } from "./base/BaseChart";
import { ChartPropTypes, Requireable } from "../../proptypes/Chart";

export { Requireable };

export class DonutChart extends React.PureComponent<IChartProps, null> {
    public static propTypes = ChartPropTypes;

    public render() {
        return <BaseChart type="donut" {...this.props} />;
    }
}
