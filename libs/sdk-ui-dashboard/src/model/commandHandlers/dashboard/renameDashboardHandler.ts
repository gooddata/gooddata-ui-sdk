// (C) 2021-2025 GoodData Corporation
import { type SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { type RenameDashboard } from "../../commands/index.js";
import { dashboardRenamed } from "../../events/dashboard.js";
import { type DashboardRenamed } from "../../events/index.js";
import { metaActions } from "../../store/meta/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* renameDashboardHandler(
    ctx: DashboardContext,
    cmd: RenameDashboard,
): SagaIterator<DashboardRenamed> {
    const { newTitle } = cmd.payload;

    yield put(metaActions.setDashboardTitle(newTitle));

    return dashboardRenamed(ctx, newTitle, cmd.correlationId);
}
