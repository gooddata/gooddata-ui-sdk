// (C) 2007-2018 GoodData Corporation
import {
    AFM
} from '@gooddata/typings';

import {
    dataSourceProvider,
    IDataSourceProviderProps
} from './DataSourceProvider';

export {
    IDataSourceProviderProps
};

import { ICommonChartProps } from '../core/base/BaseChart';
import { BarChart as CoreBarChart } from '../core/BarChart';

function generateDefaultDimensions(afm: AFM.IAfm): AFM.IDimension[] {
    return [
        {
            itemIdentifiers: ['measureGroup']
        },
        {
            itemIdentifiers: (afm.attributes || []).map(a => a.localIdentifier)
        }
    ];
}

export const BarChart = dataSourceProvider<ICommonChartProps>(CoreBarChart, generateDefaultDimensions, 'BarChart');
