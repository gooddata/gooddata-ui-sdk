// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { visualizationIsBetaWarning } from "../../helpers/utils";
import { IChartProps } from "../chartProps";
import { BaseChart } from "../../components/core/base/NewBaseChart";

export class CoreComboChart extends React.PureComponent<IChartProps, null> {
    constructor(props: IChartProps) {
        super(props);
        visualizationIsBetaWarning();
    }

    public render() {
        return <BaseChart type="combo" {...this.props} />;
    }
}
