// (C) 2021-2025 GoodData Corporation
import { type SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { type UpsertExecutionResult } from "../../commands/index.js";
import { executionResultsActions } from "../../store/executionResults/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* upsertExecutionResultHandler(
    _ctx: DashboardContext,
    cmd: UpsertExecutionResult,
): SagaIterator<void> {
    yield put(executionResultsActions.upsertExecutionResult(cmd.payload));
}
