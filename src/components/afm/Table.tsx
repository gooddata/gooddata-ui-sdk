import {
    simpleDataAdapterProvider,
    ISimpleDataAdapterProviderProps
} from './SimpleDataAdapterProvider';

// this reexport is needed to get rid of TS compiler error
// Exported variable 'BarChart' has or is using name 'ISimpleDataAdapterProviderProps' from external module
// "/Users/.../gooddata-react-components/src/components/afm/SimpleDataAdapterProvider"
// but cannot be named.
export {
    ISimpleDataAdapterProviderProps
};

import { Table as coreTable } from '../core/Table';
import { VisualizationTypes } from '../../constants/visualizationTypes';

export const Table = simpleDataAdapterProvider(coreTable, VisualizationTypes.TABLE);
