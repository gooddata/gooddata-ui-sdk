// (C) 2007-2018 GoodData Corporation
import {
    dataSourceProvider,
    IDataSourceProviderProps
} from './DataSourceProvider';

export {
    IDataSourceProviderProps
};

import { ICommonChartProps } from '../core/base/BaseChart';
import { AreaChart as CoreAreaChart } from '../core/AreaChart';
import { generateDefaultDimensions } from './afmHelper';

export const AreaChart = dataSourceProvider<ICommonChartProps>(CoreAreaChart, generateDefaultDimensions, 'AreaChart');
