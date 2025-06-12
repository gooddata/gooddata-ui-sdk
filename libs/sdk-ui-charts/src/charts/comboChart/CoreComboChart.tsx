// (C) 2007-2022 GoodData Corporation
import React from "react";
import { ICoreChartProps } from "../../interfaces/index.js";
import { BaseChart } from "../_base/BaseChart.js";

export class CoreComboChart extends React.PureComponent<ICoreChartProps> {
    public render() {
        return <BaseChart type="combo" {...this.props} />;
    }
}
