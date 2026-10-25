// (C) 2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

export enum ExecutionCoordinationActionTypeKeys {
    STORE_CURRENT_REPORT_EXECUTION_SETTLED = "STORE_CURRENT_REPORT_EXECUTION_SETTLED",
}

/**
 * The CURRENT execution finished — a result arrived and it was not superseded by a newer
 * execution.
 *
 * This is the coordination event that closes `report.nowOpen`: a report-domain value reacting to an
 * execution-domain signal. The execution domain's watcher (execution_coordination_saga.ts) re-tests
 * the same id guard the execution slice applies and emits this event, and the `nowOpen` mini-slice
 * honors it (store/report/report_slices.ts).
 */
export const currentReportExecutionSettled = createAction(
    ExecutionCoordinationActionTypeKeys.STORE_CURRENT_REPORT_EXECUTION_SETTLED,
);
