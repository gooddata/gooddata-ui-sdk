// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { BaseChart, IChartProps } from "./base/BaseChart";
import { ChartPropTypes, Requireable } from "../../proptypes/Chart";
import { getDefaultTreemapSort } from "../../helpers/sorts";

export { Requireable };

export class Treemap extends React.PureComponent<IChartProps, null> {
    public static propTypes = ChartPropTypes;

    public render() {
        const sorts = getDefaultTreemapSort(this.props.dataSource.getAfm(), this.props.resultSpec);
        const resultSpecWithSorts = {
            ...this.props.resultSpec,
            sorts,
        };
        return <BaseChart type="treemap" {...this.props} resultSpec={resultSpecWithSorts} />;
    }
}
