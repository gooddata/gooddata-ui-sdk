// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { type IUpsertExecutionResult } from "../../commands/executionResults.js";
import { executionResultsActions } from "../../store/executionResults/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* upsertExecutionResultHandler(
    _ctx: DashboardContext,
    cmd: IUpsertExecutionResult,
): SagaIterator<void> {
    yield put(executionResultsActions.upsertExecutionResult(cmd.payload));
}
