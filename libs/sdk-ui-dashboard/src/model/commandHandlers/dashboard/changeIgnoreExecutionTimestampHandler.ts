// (C) 2025-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { type IChangeIgnoreExecutionTimestamp } from "../../commands/dashboard.js";
import {
    type IDashboardIgnoreExecutionTimestampChanged,
    dashboardIgnoreExecutionTimestampChanged,
} from "../../events/dashboard.js";
import { uiActions } from "../../store/ui/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* changeIgnoreExecutionTimestampHandler(
    ctx: DashboardContext,
    cmd: IChangeIgnoreExecutionTimestamp,
): SagaIterator<IDashboardIgnoreExecutionTimestampChanged> {
    const { ignoreExecutionTimestamp } = cmd.payload;
    yield put(uiActions.changeIgnoreExecutionTimestamp(ignoreExecutionTimestamp));

    return dashboardIgnoreExecutionTimestampChanged(ctx, ignoreExecutionTimestamp, cmd.correlationId);
}
