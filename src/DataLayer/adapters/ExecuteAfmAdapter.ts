import { SDK } from '../../gooddata';
import { AFM, Execution } from '@gooddata/typings';
import { IAdapter } from '../interfaces/Adapter';
import { IDataSource } from '../interfaces/DataSource';
import { DataSource } from '../dataSources/DataSource';
import { handleMeasureDateFilter } from '../helpers/filters';
import { version as pkgVersion } from '../../../package.json';

export class ExecuteAfmAdapter implements IAdapter<Execution.IExecutionResponses> {
    private sdk: SDK;

    constructor(sdk: SDK, private projectId: string) {
        this.sdk = sdk.clone();
        this.sdk.config.setJsPackage('@gooddata/data-layer', pkgVersion);
    }

    public createDataSource(
        afm: AFM.IAfm,
        fingerprint?: string
    ): Promise<IDataSource<Execution.IExecutionResponses>> {

        const execFactory = (resultSpec: AFM.IResultSpec) => {
            const execution: AFM.IExecution = {
                execution: {
                    afm: handleMeasureDateFilter(afm),
                    resultSpec
                }
            };
            return this.sdk.execution.executeAfm(this.projectId, execution);
        };

        const responseFactory = (resultSpec: AFM.IResultSpec) => {
            const execution: AFM.IExecution = {
                execution: {
                    afm: handleMeasureDateFilter(afm),
                    resultSpec
                }
            };
            return this.sdk.execution.getExecutionResponse(this.projectId, execution);
        };

        const resultFactory = this.sdk.execution.fetchExecutionResult;

        const dataSource = new DataSource<Execution.IExecutionResponses>(
            execFactory,
            afm,
            fingerprint,
            responseFactory,
            resultFactory
        );

        return Promise.resolve(dataSource);
    }
}
