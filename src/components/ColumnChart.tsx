import * as React from 'react';
import { BaseChart, IChartProps } from './base/BaseChart';

export class ColumnChart extends React.Component<IChartProps, null> {
    public render() {
        return (
            <BaseChart
                type='column'
                {...this.props}
            />
        );
    }
}
