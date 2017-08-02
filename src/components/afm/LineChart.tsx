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
import { ICommonChartProps } from '../core/base/BaseChart';
import { LineChart as coreLineChart } from '../core/LineChart';

export const LineChart = simpleDataAdapterProvider<ICommonChartProps>(coreLineChart, 'line');
