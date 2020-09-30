// (C) 2019-2020 GoodData Corporation

import { AxiosInstance, AxiosResponse } from "axios";
import { AfmExecution, AfmExecutionResponse, ExecutionResult } from "./generated/afm-rest-api";

/**
 * Tiger execution client factory
 *
 */
export const tigerExecutionClientFactory = (
    axios: AxiosInstance,
): {
    executeAfm: (workspaceId: string, execution: AfmExecution) => Promise<AfmExecutionResponse>;
    executionResult: (
        workspaceId: string,
        resultId: string,
        offset?: number[] | undefined,
        size?: number[] | undefined,
    ) => Promise<ExecutionResult>;
} => {
    /**
     * Starts a new AFM execution.
     *
     * @param workspaceId workspace identifier
     * @param execution - execution to send as-is in request body
     * @public
     */
    const executeAfm = (workspaceId: string, execution: AfmExecution): Promise<AfmExecutionResponse> => {
        return axios
            .post(`/api/workspaces/${workspaceId}/afm`, execution)
            .then((res: AxiosResponse<AfmExecutionResponse>) => {
                return res.data;
            });
    };

    /**
     * Retrieves result of execution. All calculated data is returned, no paging yet.
     *
     * @param workspaceId workspace identifier
     * @param resultId - ID of AFM execution result
     * @param offset
     * @param size
     * @public
     */
    const executionResult = (
        workspaceId: string,
        resultId: string,
        offset?: number[],
        size?: number[],
    ): Promise<ExecutionResult> => {
        const params = { limit: size && size.join(","), offset: offset && offset.join(",") };

        return axios
            .get(`/api/workspaces/${workspaceId}/result/${resultId}`, { params })
            .then((res: AxiosResponse<ExecutionResult>) => {
                return res.data;
            });
    };

    return {
        executeAfm,
        executionResult,
    };
};
