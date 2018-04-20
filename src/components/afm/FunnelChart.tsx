// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';
import {
    dataSourceProvider,
    IDataSourceProviderProps
} from './DataSourceProvider';

export {
    IDataSourceProviderProps
};

import { ICommonChartProps } from '../core/base/BaseChart';
import { FunnelChart as CoreFunnelChart } from '../core/FunnelChart';

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
 * AFM FunnelChart
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const FunnelChart =
    dataSourceProvider<ICommonChartProps>(CoreFunnelChart, generateDefaultDimensions, 'FunnelChart');
