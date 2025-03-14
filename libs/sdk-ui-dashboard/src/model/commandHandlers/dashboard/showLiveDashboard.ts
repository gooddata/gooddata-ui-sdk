// (C) 2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { ShowLiveDashboard } from "../../commands/index.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { uiActions } from "../../store/ui/index.js";
import { LiveDashboardRequested, liveDashboardRequested } from "../../events/dashboard.js";
import { put } from "redux-saga/effects";

export function* showLiveDashboardHandler(
    ctx: DashboardContext,
    cmd: ShowLiveDashboard,
): SagaIterator<LiveDashboardRequested> {
    yield put(uiActions.ignoreSnapshotTime());

    return liveDashboardRequested(ctx, cmd.correlationId);
}
