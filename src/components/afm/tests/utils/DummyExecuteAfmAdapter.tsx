// (C) 2007-2018 GoodData Corporation
import { SDK, DataLayer } from "@gooddata/gooddata-js";
import { AFM, Execution } from "@gooddata/typings";
import { executionResponses, executionResponsesTable } from "./dummyFixture";

export class DummyExecuteAfmAdapter extends DataLayer.ExecuteAfmAdapter {
    public createDataSource(
        afm: AFM.IAfm,
        fingerprint?: string,
    ): Promise<DataLayer.DataSource.IDataSource<Execution.IExecutionResponses>> {
        const execFactory = () => {
            return Promise.resolve(executionResponses);
        };
        const dataSource = new DataLayer.DataSource.DataSource<Execution.IExecutionResponses>(
            execFactory,
            afm,
            fingerprint,
        );
        return Promise.resolve(dataSource);
    }
}

export function dummyExecuteAfmAdapterFactory(sdk: SDK, projectId: string) {
    return new DummyExecuteAfmAdapter(sdk, projectId);
}

export class DummyExecuteAfmAdapterTable extends DataLayer.ExecuteAfmAdapter {
    public createDataSource(
        afm: AFM.IAfm,
        fingerprint?: string,
    ): Promise<DataLayer.DataSource.IDataSource<Execution.IExecutionResponses>> {
        const execFactory = () => {
            return Promise.resolve(executionResponsesTable);
        };
        const dataSource = new DataLayer.DataSource.DataSource<Execution.IExecutionResponses>(
            execFactory,
            afm,
            fingerprint,
        );
        return Promise.resolve(dataSource);
    }
}

export function dummyExecuteAfmAdapterFactoryTable(sdk: SDK, projectId: string) {
    return new DummyExecuteAfmAdapterTable(sdk, projectId);
}
