// (C) 2007-2018 GoodData Corporation
import {
    dataSourceProvider,
    IDataSourceProviderProps
} from './DataSourceProvider';

export {
    IDataSourceProviderProps
};

import { ICommonChartProps } from '../core/base/BaseChart';
import { ComboChart as CoreComboChart } from '../core/ComboChart';
import { generateDefaultDimensions } from './afmHelper';

/**
 * AFM ComboChart
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const ComboChart = dataSourceProvider<ICommonChartProps>(
    CoreComboChart, generateDefaultDimensions, 'ComboChart');
