// (C) 2007-2022 GoodData Corporation
import React from "react";
import { visualizationIsBetaWarning } from "@gooddata/sdk-ui";
import { BaseChart } from "../_base/BaseChart";
import { ICoreChartProps } from "../../interfaces";

export class CoreFunnelChart extends React.PureComponent<ICoreChartProps> {
    constructor(props: ICoreChartProps) {
        super(props);
        visualizationIsBetaWarning();
    }

    public render() {
        return <BaseChart type="funnel" {...this.props} />;
    }
}
