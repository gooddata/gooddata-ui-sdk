// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { BaseChart, IChartProps } from './base/BaseChart';
import { ChartPropTypes, Requireable } from '../../proptypes/Chart';
import { visualizationIsBetaWarning } from '../../helpers/utils';

export { Requireable };

export class Heatmap extends React.Component<IChartProps, null> {
    public static propTypes = ChartPropTypes;

    constructor(props: IChartProps) {
        super(props);
        visualizationIsBetaWarning();
    }

    public render() {
        return (
            <BaseChart
                type="heatmap"
                {...this.props}
            />
        );
    }
}
