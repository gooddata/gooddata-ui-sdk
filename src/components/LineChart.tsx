import * as React from 'react';
import { BaseChart, IChartProps } from './base/BaseChart';

export class LineChart extends React.Component<IChartProps, null> {
    public render() {
        return (
            <BaseChart
                type='line'
                {...this.props}
            />
        );
    }
}
