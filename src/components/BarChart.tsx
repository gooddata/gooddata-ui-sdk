import * as React from 'react';
import { BaseChart, IChartProps } from './base/BaseChart';

export class BarChart extends React.Component<IChartProps, null> {
    public render() {
        return (
            <BaseChart
                type="bar"
                {...this.props}
            />
        );
    }
}
