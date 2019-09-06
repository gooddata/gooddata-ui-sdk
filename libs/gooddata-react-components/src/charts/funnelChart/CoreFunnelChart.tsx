// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { BaseChart } from "../../components/core/base/NewBaseChart";
import { visualizationIsBetaWarning } from "../../helpers/utils";
import { IChartProps } from "../chartProps";

export class CoreFunnelChart extends React.PureComponent<IChartProps, null> {
    constructor(props: IChartProps) {
        super(props);
        visualizationIsBetaWarning();
    }

    public render() {
        return <BaseChart type="funnel" {...this.props} />;
    }
}
