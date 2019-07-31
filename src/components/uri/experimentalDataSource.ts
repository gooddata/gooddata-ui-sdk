// (C) 2019 GoodData Corporation
import { SDK } from "@gooddata/gooddata-js";
import { DataSource } from "@gooddata/gooddata-js/lib/DataLayer/dataSources/DataSource";
import { IDataSource } from "@gooddata/gooddata-js/lib/DataLayer/interfaces/DataSource";
import { IVisualizationExecution } from "@gooddata/gooddata-js/lib/execution/execute-afm";
import { AFM, Execution } from "@gooddata/typings";

/**
 *
 * Factory function to create a new instance of IDataSource, which uses executeVisualization API instead of
 * executeAFM API in order to calculate results for a stored visualization object.
 *
 * This functionality is experimental at the moment and is intended for GoodData internal
 * testing and validation.
 *
 * NOTE: counter-intuitively, AFM must be sent as well at the moment because IDataSource interface expose
 * the effective AFM and there are parts of SDK that rely on this (such as coloring).
 *
 * @param sdk instance of gooddata-js to use
 * @param projectId GD project identifier
 * @param reference URI of stored visualization
 * @param afm AFM of the stored visualization
 * @param filters filters to merge with filters stored in the visualization
 * @private
 * @internal
 */
export function _experimentalDataSourceFactory(
    sdk: SDK,
    projectId: string,
    reference: string,
    afm: AFM.IAfm,
    filters: AFM.CompatibilityFilter[],
): Promise<IDataSource<Execution.IExecutionResponses>> {
    // We have ONE-3961 as followup to take this out of experimental mode

    const sdkCopy = sdk.clone();
    const execFactory = (resultSpec: AFM.IResultSpec) => {
        const visExecution: IVisualizationExecution = {
            visualizationExecution: {
                reference,
                filters,
                resultSpec,
            },
        };

        return sdkCopy.execution._executeVisualization(projectId, visExecution);
    };

    const responseFactory = (resultSpec: AFM.IResultSpec) => {
        const visExecution: IVisualizationExecution = {
            visualizationExecution: {
                reference,
                filters,
                resultSpec,
            },
        };

        return sdkCopy.execution._getVisExecutionResponse(projectId, visExecution);
    };

    const resultFactory = sdkCopy.execution.getPartialExecutionResult;

    const dataSource = new DataSource<Execution.IExecutionResponses>(
        execFactory,
        afm,
        undefined,
        responseFactory,
        resultFactory,
    );

    return Promise.resolve(dataSource);
}
