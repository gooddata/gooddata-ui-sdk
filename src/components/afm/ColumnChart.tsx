// (C) 2007-2018 GoodData Corporation
import {
    dataSourceProvider,
    IDataSourceProviderProps
} from './DataSourceProvider';

export {
    IDataSourceProviderProps
};

import { ICommonChartProps } from '../core/base/BaseChart';
import { ColumnChart as CoreColumnChart } from '../core/ColumnChart';
import { generateDefaultDimensions } from './afmHelper';

export const ColumnChart = dataSourceProvider<ICommonChartProps>(
    CoreColumnChart, generateDefaultDimensions, 'ColumnChart');
