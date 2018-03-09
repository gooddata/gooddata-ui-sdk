// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';
import {
    dataSourceProvider,
    IDataSourceProviderProps
} from './DataSourceProvider';

export {
    IDataSourceProviderProps
};

import { Headline as CoreHeadline } from '../core/Headline';

function generateDefaultDimensions(): AFM.IDimension[] {
    return [
        { itemIdentifiers: ['measureGroup'] }
    ];
}

export const Headline = dataSourceProvider(CoreHeadline, generateDefaultDimensions, 'CoreHeadline');
