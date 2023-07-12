// (C) 2007-2019 GoodData Corporation

import { IExecution } from "@gooddata/api-model-bear";

/**
 * Converts 'client-land' AFM to JSON payload acceptable by REST API.
 *
 * @param execution - execution to send to API
 */
export function convertExecutionToJson(execution: IExecution): string {
    return JSON.stringify(execution);
}
