import * as React from 'react';
import { BaseChart, IChartProps } from './base/BaseChart';

export class PieChart extends React.Component<IChartProps, null> {
    public render() {
        return (
            <BaseChart
                type='pie'
                {...this.props}
            />
        );
    }
}
