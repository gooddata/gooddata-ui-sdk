// (C) 2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes.js";
import { ChangeIgnoreExecutionTimestamp } from "../../commands/dashboard.js";
import { uiActions } from "../../store/ui/index.js";
import {
    DashboardIgnoreExecutionTimestampChanged,
    dashboardIgnoreExecutionTimestampChanged,
} from "../../events/dashboard.js";
import { put } from "redux-saga/effects";

export function* changeIgnoreExecutionTimestampHandler(
    ctx: DashboardContext,
    cmd: ChangeIgnoreExecutionTimestamp,
): SagaIterator<DashboardIgnoreExecutionTimestampChanged> {
    const { ignoreExecutionTimestamp } = cmd.payload;
    yield put(uiActions.changeIgnoreExecutionTimestamp(ignoreExecutionTimestamp));

    return dashboardIgnoreExecutionTimestampChanged(ctx, ignoreExecutionTimestamp, cmd.correlationId);
}
