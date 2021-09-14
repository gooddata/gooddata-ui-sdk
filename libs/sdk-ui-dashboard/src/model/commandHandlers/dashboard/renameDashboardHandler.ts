// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { RenameDashboard } from "../../commands";
import { SagaIterator } from "redux-saga";
import { DashboardRenamed } from "../../events";
import { dashboardRenamed } from "../../events/dashboard";
import { metaActions } from "../../state/meta";
import { put } from "redux-saga/effects";

export function* renameDashboardHandler(
    ctx: DashboardContext,
    cmd: RenameDashboard,
): SagaIterator<DashboardRenamed> {
    const { newTitle } = cmd.payload;

    yield put(metaActions.setDashboardTitle(newTitle));

    return dashboardRenamed(ctx, newTitle, cmd.correlationId);
}
