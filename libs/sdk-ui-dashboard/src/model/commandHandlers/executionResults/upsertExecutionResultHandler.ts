// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { UpsertExecutionResult } from "../../commands";
import { executionResultsActions } from "../../store/executionResults";

export function* upsertExecutionResultHandler(
    _ctx: DashboardContext,
    cmd: UpsertExecutionResult,
): SagaIterator<void> {
    yield put(executionResultsActions.upsertExecutionResult(cmd.payload));
}
