// (C) 2021 GoodData Corporation
import { all, call, put } from "redux-saga/effects";
import { LoadDashboard } from "../../commands/dashboard";
import { eventDispatcher } from "../../eventEmitter/eventDispatcher";
import { dashboardLoaded } from "../../events/dashboard";
import { filterContextActions } from "../../state/filterContext";
import { insightsActions } from "../../state/insights";
import { layoutActions } from "../../state/layout";
import { loadingActions } from "../../state/loading";
import { DashboardConfig, DashboardContext } from "../../types/commonTypes";
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { loadDashboardConfig } from "./configLoader";
import { configActions } from "../../state/config";

function loadDashboardFromBackend(ctx: DashboardContext): Promise<IDashboardWithReferences> {
    const { backend, workspace, dashboardRef } = ctx;

    return backend.workspace(workspace).dashboards().getDashboardWithReferences(dashboardRef!);
}

export function* loadDashboardCommandHandler(ctx: DashboardContext, cmd: LoadDashboard) {
    // eslint-disable-next-line no-console
    console.debug("handling load dashboard", cmd, "in context", ctx);

    try {
        yield put(loadingActions.setLoadingStart());

        // TODO: how to type this properly?
        const [dashboardWithReferences, config]: [IDashboardWithReferences, DashboardConfig] = yield all([
            call(loadDashboardFromBackend, ctx),
            call(loadDashboardConfig, ctx, cmd),
        ]);

        const { dashboard, references } = dashboardWithReferences;

        yield put(configActions.setConfig(config));
        yield put(filterContextActions.setFilterContext(dashboard.filterContext));
        yield put(layoutActions.setLayout(dashboard.layout));
        yield put(loadingActions.setLoadingSuccess());
        yield put(insightsActions.setInsights(references.insights));

        yield call(eventDispatcher, dashboardLoaded(ctx, dashboard, references.insights, config));
    } catch (e) {
        yield put(loadingActions.setLoadingError(e));
    }
}
