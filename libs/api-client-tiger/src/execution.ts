// (C) 2019-2020 GoodData Corporation

import { AxiosInstance, AxiosResponse } from "axios";
import { ExecuteAFM } from "./gd-tiger-model/ExecuteAFM";
import { Execution } from "./gd-tiger-model/Execution";

/**
 * Tiger execution client factory
 *
 */
export const tigerExecutionClientFactory = (
    axios: AxiosInstance,
): {
    executeAfm: (
        workspaceId: string,
        execution: ExecuteAFM.IExecution,
    ) => Promise<Execution.IExecutionResponse>;
    executionResult: (
        workspaceId: string,
        resultId: string,
        offset?: number[] | undefined,
        size?: number[] | undefined,
    ) => Promise<Execution.IExecutionResult>;
} => {
    /**
     * Starts a new AFM execution.
     *
     * @param axios - instance of configured http client to use
     * @param workspaceId workspace identifier
     * @param execution - execution to send as-is in request body
     * @public
     */
    const executeAfm = (
        workspaceId: string,
        execution: ExecuteAFM.IExecution,
    ): Promise<Execution.IExecutionResponse> => {
        return axios
            .post(`/api/workspaces/${workspaceId}/afm`, execution)
            .then((res: AxiosResponse<Execution.IExecutionResponse>) => {
                return res.data;
            });
    };

    /**
     * Retrieves result of execution. All calculated data is returned, no paging yet.
     *
     * @param axios - instance of configured http client to use
     * @param workspaceId workspace identifier
     * @param resultId - ID of AFM execution result
     * @public
     */
    const executionResult = (
        workspaceId: string,
        resultId: string,
        offset?: number[],
        size?: number[],
    ): Promise<Execution.IExecutionResult> => {
        const params = { limit: size && size.join(","), offset: offset && offset.join(",") };

        return axios
            .get(`/api/workspaces/${workspaceId}/result/${resultId}`, { params })
            .then((res: AxiosResponse<Execution.IExecutionResult>) => {
                return res.data;
            });
    };

    return {
        executeAfm,
        executionResult,
    };
};
