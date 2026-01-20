// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { type IRenameDashboard } from "../../commands/index.js";
import { dashboardRenamed } from "../../events/dashboard.js";
import { type IDashboardRenamed } from "../../events/index.js";
import { metaActions } from "../../store/meta/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* renameDashboardHandler(
    ctx: DashboardContext,
    cmd: IRenameDashboard,
): SagaIterator<IDashboardRenamed> {
    const { newTitle } = cmd.payload;

    yield put(metaActions.setDashboardTitle(newTitle));

    return dashboardRenamed(ctx, newTitle, cmd.correlationId);
}
