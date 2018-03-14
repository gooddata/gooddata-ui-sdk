// (C) 2007-2018 GoodData Corporation
import * as GoodData from 'gooddata';
import { DataSource, ExecuteAfmAdapter } from '@gooddata/data-layer';
import { AFM, Execution } from '@gooddata/typings';
import IDataSource = DataSource.IDataSource;
import { executionResponses } from './dummyFixture';

export class DummyExecuteAfmAdapter extends ExecuteAfmAdapter {
    public createDataSource(afm: AFM.IAfm, fingerprint?: string): Promise<IDataSource<Execution.IExecutionResponses>> {
        const execFactory = () => {
            return Promise.resolve(executionResponses);
        };
        const dataSource = new DataSource.DataSource<Execution.IExecutionResponses>(
            execFactory,
            afm,
            fingerprint
        );
        return Promise.resolve(dataSource);
    }
}

export function dummyExecuteAfmAdapterFactory(sdk: typeof GoodData, projectId: string) {
    return new DummyExecuteAfmAdapter(sdk, projectId);
}
