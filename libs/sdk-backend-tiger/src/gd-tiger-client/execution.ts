// (C) 2019 GoodData Corporation

import { AxiosInstance, AxiosResponse } from "axios";
import { ExecuteAFM } from "../gd-tiger-model/ExecuteAFM";
import { Execution } from "../gd-tiger-model/Execution";

/**
 * Starts a new AFM execution.
 *
 * @param axios - instance of configured http client to use
 * @param execution - execution to send as-is in request body
 * @internal
 */
export function executeAfm(
    axios: AxiosInstance,
    execution: ExecuteAFM.IExecution,
): Promise<Execution.IExecutionResponse> {
    return axios.post("/api/afm", execution).then((res: AxiosResponse<Execution.IExecutionResponse>) => {
        return res.data;
    });
}

/**
 * Retrieves result of execution. All calculated data is returned, no paging yet.
 *
 * @param axios - instance of configured http client to use
 * @param resultLink - link to AFM execution result
 * @internal
 */
export function executionResult(
    axios: AxiosInstance,
    resultLink: string,
): Promise<Execution.IExecutionResult> {
    return axios.get(`${resultLink}`).then((res: AxiosResponse<Execution.IExecutionResult>) => {
        return res.data;
    });
}
