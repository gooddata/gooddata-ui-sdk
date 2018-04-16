// (C) 2007-2018 GoodData Corporation
import {
    dataSourceProvider,
    IDataSourceProviderProps
} from './DataSourceProvider';

export {
    IDataSourceProviderProps
};

import { ICommonChartProps } from '../core/base/BaseChart';
import { ScatterPlot as CoreScatterPlot } from '../core/ScatterPlot';
import { generateDefaultDimensions } from './afmHelper';

/**
 * AFM ScatterPlot
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const ScatterPlot =
    dataSourceProvider<ICommonChartProps>(CoreScatterPlot, generateDefaultDimensions, 'ScatterPlot');
