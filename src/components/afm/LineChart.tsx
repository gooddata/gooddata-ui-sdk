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

export const LineChart = dataSourceProvider<ICommonChartProps>(CoreLineChart, generateDefaultDimensions, 'LineChart');
