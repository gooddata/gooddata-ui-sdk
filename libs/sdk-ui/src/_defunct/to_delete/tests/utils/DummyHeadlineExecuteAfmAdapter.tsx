// (C) 2007-2018 GoodData Corporation
import { SDK, DataLayer } from "@gooddata/gd-bear-client";
import { AFM, Execution } from "@gooddata/gd-bear-model/dist/index";
import { executionResponses } from "./dummyHeadlineFixture";

export class DummyHeadlineExecuteAfmAdapter extends DataLayer.ExecuteAfmAdapter {
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

export function dummyHeadlineExecuteAfmAdapterFactory(sdk: SDK, projectId: string) {
    return new DummyHeadlineExecuteAfmAdapter(sdk, projectId);
}
