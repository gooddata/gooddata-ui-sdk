// (C) 2007-2018 GoodData Corporation
import {
    dataSourceProvider,
    IDataSourceProviderProps
} from './DataSourceProvider';

export {
    IDataSourceProviderProps
};

import { ICommonChartProps } from '../core/base/BaseChart';
import { DualChart as CoreDualChart } from '../core/DualChart';
import { generateDefaultDimensions } from './afmHelper';

/**
 * AFM DualChart
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const DualChart = dataSourceProvider<ICommonChartProps>(CoreDualChart, generateDefaultDimensions, 'DualChart');
