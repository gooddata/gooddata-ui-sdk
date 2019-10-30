// (C) 2007-2019 GoodData Corporation

import { ExecuteAFM } from "@gooddata/gd-bear-model";

/**
 * Converts 'client-land' AFM to JSON payload acceptable by REST API.
 *
 * @param execution execution to send to API
 */
export function convertExecutionToJson(execution: ExecuteAFM.IExecution): string {
    return JSON.stringify(execution);
}
