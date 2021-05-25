// (C) 2021 GoodData Corporation
import { call, put } from "redux-saga/effects";
import { LoadDashboard } from "../commands/dashboard";
import { eventDispatcher } from "../eventEmitter/eventDispatcher";
import { dashboardLoaded } from "../events/dashboard";
import { filterContextActions } from "../state/filterContext";
import { insightsActions } from "../state/insights";
import { layoutActions } from "../state/layout";
import { loadingActions } from "../state/loading";
import { DashboardContext } from "../types/commonTypes";
import { PromiseFnReturnType } from "../types/sagas";

async function loadDashboardFromBackend(ctx: DashboardContext) {
    const { backend, workspace, dashboardRef } = ctx;

    return backend.workspace(workspace).dashboards().getDashboardWithReferences(dashboardRef!);
}

export function* loadDashboardCommandHandler(ctx: DashboardContext, cmd: LoadDashboard) {
    // eslint-disable-next-line no-console
    console.debug("handling load dashboard", cmd, "in context", ctx);

    try {
        yield put(loadingActions.setLoadingStart());

        const dashboardWithReferences: PromiseFnReturnType<typeof loadDashboardFromBackend> = yield call(
            loadDashboardFromBackend,
            ctx,
        );

        const { dashboard, references } = dashboardWithReferences;

        yield put(filterContextActions.setFilterContext(dashboard.filterContext));
        yield put(layoutActions.setLayout(dashboard.layout));
        yield put(loadingActions.setLoadingSuccess());
        yield put(insightsActions.setInsights(references.insights));

        yield call(eventDispatcher, dashboardLoaded(ctx, dashboard, references.insights));
    } catch (e) {
        yield put(loadingActions.setLoadingError(e));
    }
}
