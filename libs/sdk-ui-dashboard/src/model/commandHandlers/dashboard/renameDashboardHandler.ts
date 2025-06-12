// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes.js";
import { RenameDashboard } from "../../commands/index.js";
import { SagaIterator } from "redux-saga";
import { DashboardRenamed } from "../../events/index.js";
import { dashboardRenamed } from "../../events/dashboard.js";
import { metaActions } from "../../store/meta/index.js";
import { put } from "redux-saga/effects";

export function* renameDashboardHandler(
    ctx: DashboardContext,
    cmd: RenameDashboard,
): SagaIterator<DashboardRenamed> {
    const { newTitle } = cmd.payload;

    yield put(metaActions.setDashboardTitle(newTitle));

    return dashboardRenamed(ctx, newTitle, cmd.correlationId);
}
