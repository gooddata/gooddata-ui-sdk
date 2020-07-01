// (C) 2019-2020 GoodData Corporation

import { AxiosInstance, AxiosResponse } from "axios";
import { ExecuteAFM } from "./gd-tiger-model/ExecuteAFM";
import { Execution } from "./gd-tiger-model/Execution";

/**
 * Tiger execution client factory
 *
 */
export const tigerExecutionClientFactory = (axios: AxiosInstance) => {
    /**
     * Starts a new AFM execution.
     *
     * @param axios - instance of configured http client to use
     * @param execution - execution to send as-is in request body
     * @public
     */
    const executeAfm = (execution: ExecuteAFM.IExecution): Promise<Execution.IExecutionResponse> => {
        return axios.post("/api/afm", execution).then((res: AxiosResponse<Execution.IExecutionResponse>) => {
            return res.data;
        });
    };

    /**
     * Retrieves result of execution. All calculated data is returned, no paging yet.
     *
     * @param axios - instance of configured http client to use
     * @param resultId - ID of AFM execution result
     * @public
     */
    const executionResult = (
        resultId: string,
        offset?: number[],
        size?: number[],
    ): Promise<Execution.IExecutionResult> => {
        const params = { limit: size && size.join(","), offset: offset && offset.join(",") };

        return axios
            .get(`/api/result/${resultId}`, { params })
            .then((res: AxiosResponse<Execution.IExecutionResult>) => {
                return res.data;
            });
    };

    return {
        executeAfm,
        executionResult,
    };
};
