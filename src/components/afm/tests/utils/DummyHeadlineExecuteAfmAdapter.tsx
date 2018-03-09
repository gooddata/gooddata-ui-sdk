// (C) 2007-2018 GoodData Corporation
import { ISdk } from 'gooddata';
import { DataSource, ExecuteAfmAdapter } from '@gooddata/data-layer';
import { AFM, Execution } from '@gooddata/typings';
import { executionResponses } from './dummyHeadlineFixture';

export class DummyHeadlineExecuteAfmAdapter extends ExecuteAfmAdapter {
    public createDataSource(afm: AFM.IAfm,
                            fingerprint?: string): Promise<DataSource.IDataSource<Execution.IExecutionResponses>> {
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

export function dummyHeadlineExecuteAfmAdapterFactory(sdk: ISdk, projectId: string) {
    return new DummyHeadlineExecuteAfmAdapter(sdk, projectId);
}
