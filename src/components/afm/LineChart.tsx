// (C) 2007-2018 GoodData Corporation
import {
    dataSourceProvider,
    IDataSourceProviderProps
} from './DataSourceProvider';

export {
    IDataSourceProviderProps
};

import { ICommonChartProps } from '../core/base/BaseChart';
import { LineChart as CoreLineChart } from '../core/LineChart';
import { generateDefaultDimensions } from './afmHelper';

/**
 * AFM LineChart
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const LineChart = dataSourceProvider<ICommonChartProps>(CoreLineChart, generateDefaultDimensions, 'LineChart');
