// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { BaseChart, IChartProps } from './base/BaseChart';
import { Requireable } from '../../proptypes/Chart';

export { Requireable };

export class BubbleChart extends React.Component<IChartProps, null> {
    public render() {
        return (
            <BaseChart
                type="bubble"
                {...this.props}
            />
        );
    }
}
