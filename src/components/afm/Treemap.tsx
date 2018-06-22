// (C) 2007-2018 GoodData Corporation
import { dataSourceProvider, IDataSourceProviderProps } from './DataSourceProvider';

export {
    IDataSourceProviderProps
};

import { ICommonChartProps } from '../core/base/BaseChart';
import { Treemap as CoreTreemap } from '../core/Treemap';
import { getTreemapDimensionsFromAFM } from '../../helpers/dimensions';

/**
 * AFM Treemap
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const Treemap = dataSourceProvider<ICommonChartProps>(
    CoreTreemap,
    getTreemapDimensionsFromAFM,
    'Treemap'
);
