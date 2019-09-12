// (C) 2007-2018 GoodData Corporation
import { SDK } from "../../gooddata";
import { AFM, Execution } from "@gooddata/typings";
import { IAdapter } from "..";
import { IDataSource } from "../interfaces/DataSource";
import { DataSource } from "../dataSources/DataSource";
import { version as pkgVersion } from "../../../package.json";

export class ExecuteAfmAdapter implements IAdapter<Execution.IExecutionResponses> {
    private sdk: SDK;

    constructor(sdk: SDK, public projectId: string) {
        this.sdk = sdk.clone();
        this.sdk.config.setJsPackage("@gooddata/data-layer", pkgVersion);
    }

    public createDataSource(
        afm: AFM.IAfm,
        fingerprint?: string,
    ): Promise<IDataSource<Execution.IExecutionResponses>> {
        const execFactory = (resultSpec: AFM.IResultSpec) => {
            const execution: AFM.IExecution = {
                execution: {
                    afm,
                    resultSpec,
                },
            };
            return this.sdk.execution.executeAfm(this.projectId, execution);
        };

        const responseFactory = (resultSpec: AFM.IResultSpec) => {
            const execution: AFM.IExecution = {
                execution: {
                    afm,
                    resultSpec,
                },
            };
            return this.sdk.execution.getExecutionResponse(this.projectId, execution);
        };

        const resultFactory = this.sdk.execution.getPartialExecutionResult;

        const dataSource = new DataSource<Execution.IExecutionResponses>(
            execFactory,
            afm,
            fingerprint,
            responseFactory,
            resultFactory,
        );

        return Promise.resolve(dataSource);
    }
}
