// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { ICoreChartProps } from "../chartProps";
import { BaseChart } from "../_base/BaseChart";

export class CoreComboChart extends React.PureComponent<ICoreChartProps, null> {
    constructor(props: ICoreChartProps) {
        super(props);
    }

    public render() {
        return <BaseChart type="combo" {...this.props} />;
    }
}
