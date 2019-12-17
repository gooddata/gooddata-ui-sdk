// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { visualizationIsBetaWarning } from "../../base/helpers/logging";
import { BaseChart } from "../_base/BaseChart";
import { ICoreChartProps } from "../chartProps";

export class CoreFunnelChart extends React.PureComponent<ICoreChartProps, null> {
    constructor(props: ICoreChartProps) {
        super(props);
        visualizationIsBetaWarning();
    }

    public render() {
        return <BaseChart type="funnel" {...this.props} />;
    }
}
