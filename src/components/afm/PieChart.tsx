import { AFM } from '@gooddata/typings';
import {
    dataSourceProvider,
    IDataSourceProviderProps
} from './DataSourceProvider';

export {
    IDataSourceProviderProps
};

import { ICommonChartProps } from '../core/base/BaseChart';
import { PieChart as CorePieChart } from '../core/PieChart';

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

export const PieChart = dataSourceProvider<ICommonChartProps>(CorePieChart, generateDefaultDimensions, 'PieChart');
