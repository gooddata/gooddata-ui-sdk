// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';
import {
    dataSourceProvider,
    IDataSourceProviderProps
} from './DataSourceProvider';

export {
    IDataSourceProviderProps
};

import { SortableTable } from '../core/SortableTable';

function generateDefaultDimensions(afm: AFM.IAfm): AFM.IDimension[] {
    return [
        {
            itemIdentifiers: (afm.attributes || []).map(a => a.localIdentifier)
        },
        {
            itemIdentifiers: afm.measures ? ['measureGroup'] : []
        }
    ];
}

/**
 * AFM Table
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const Table = dataSourceProvider(SortableTable, generateDefaultDimensions, 'Table');
