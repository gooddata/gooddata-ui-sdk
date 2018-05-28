// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { BaseChart, IChartProps } from './base/BaseChart';
import { ChartPropTypes, Requireable } from '../../proptypes/Chart';
import { DEFAULT_SERIES_LIMIT } from '../visualizations/chart/highcharts/commonConfiguration';

export { Requireable };

export class ScatterPlot extends React.Component<IChartProps, null> {
    public static propTypes = ChartPropTypes;

    public render() {
        const { config } = this.props;
        const defaultConfig = {
            limits: {
                series: DEFAULT_SERIES_LIMIT,
                categories: DEFAULT_SERIES_LIMIT
            }
        };
        const finalConfig = {
            ...defaultConfig,
            ...config
        };
        return (
            <BaseChart
                type="scatter"
                {...this.props}
                config={finalConfig}
            />
        );
    }
}
