import * as React from 'react';
import { BaseChart, IChartProps } from './base/BaseChart';
import { ChartPropTypes, Requireable } from '../../proptypes/Chart';

export { Requireable };

export class PieChart extends React.Component<IChartProps, null> {
    public static propTypes = ChartPropTypes;

    public render() {
        return (
            <BaseChart
                type="pie"
                {...this.props}
            />
        );
    }
}
