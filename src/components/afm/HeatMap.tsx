// (C) 2007-2018 GoodData Corporation
import {
    dataSourceProvider,
    IDataSourceProviderProps
} from './DataSourceProvider';

export {
    IDataSourceProviderProps
};

import { ICommonChartProps } from '../core/base/BaseChart';
import { HeatMap as CoreHeatMap } from '../core/HeatMap';
import { generateDefaultDimensions } from './afmHelper';

export const HeatMap = dataSourceProvider<ICommonChartProps>(CoreHeatMap, generateDefaultDimensions, 'HeatMap');
