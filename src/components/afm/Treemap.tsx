// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';
import { dataSourceProvider, IDataSourceProviderProps } from './DataSourceProvider';

export {
    IDataSourceProviderProps
};

import { ICommonChartProps } from '../core/base/BaseChart';
import { Treemap as CoreTreemap } from '../core/Treemap';

function generateDefaultDimensions(afm: AFM.IAfm): AFM.IDimension[] {
    if ((afm.attributes || []).length === 0) {
        return [
            {
                itemIdentifiers: []
            },
            {
                itemIdentifiers: ['measureGroup']
            }
        ];
    }

    return [
        {
            itemIdentifiers: ['measureGroup']
        },
        {
            itemIdentifiers: (afm.attributes || []).map(a => a.localIdentifier)
        }
    ];
}

/**
 * AFM Treemap
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const Treemap = dataSourceProvider<ICommonChartProps>(
    CoreTreemap,
    generateDefaultDimensions,
    'Treemap'
);
