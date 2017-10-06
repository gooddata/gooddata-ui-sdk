import * as React from 'react';
import { BaseChart, IChartProps } from './base/BaseChart';
import { ChartPropTypes, Requireable } from '../../proptypes/Chart';

export { Requireable };

export class LineChart extends React.Component<IChartProps, null> {
    public static propTypes = ChartPropTypes;

    public render() {
        return (
            <BaseChart
                type="line"
                {...this.props}
            />
        );
    }
}
