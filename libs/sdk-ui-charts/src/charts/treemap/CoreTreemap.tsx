// (C) 2007-2018 GoodData Corporation
import React from "react";
import { BaseChart } from "../_base/BaseChart";
import { ICoreChartProps } from "../../interfaces";

export class CoreTreemap extends React.PureComponent<ICoreChartProps, null> {
    public render(): React.ReactNode {
        return <BaseChart type="treemap" {...this.props} />;
    }
}
