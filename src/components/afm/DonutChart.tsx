// (C) 2007-2018 GoodData Corporation
import {
    dataSourceProvider,
    IDataSourceProviderProps
} from './DataSourceProvider';

export {
    IDataSourceProviderProps
};

import { ICommonChartProps } from '../core/base/BaseChart';
import { DonutChart as CoreDonutChart } from '../core/DonutChart';
import { generateDefaultDimensionsForRoundChart as generateDefaultDimensions } from './afmHelper';

/**
 * AFM DonutChart
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const DonutChart = dataSourceProvider<ICommonChartProps>(
    CoreDonutChart,
    generateDefaultDimensions,
    'DonutChart'
);
