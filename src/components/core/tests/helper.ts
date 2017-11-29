import { IChartProps } from '../base/BaseChart';
import { IDataSource } from '../../../interfaces/DataSource';
import { emptyResponse } from '../../../execution/fixtures/ExecuteAfm.fixtures';

export function getComponentProps(): IChartProps {
    const dataSource: IDataSource = {
        getData: () => Promise.resolve(emptyResponse),
        getAfm: () => ({}),
        getFingerprint: () => '{}'
    };
    return {
        dataSource
    };
}
