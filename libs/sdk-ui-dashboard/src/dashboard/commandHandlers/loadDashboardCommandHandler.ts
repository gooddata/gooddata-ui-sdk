// (C) 2021 GoodData Corporation
import { call, put } from "redux-saga/effects";
import { LoadDashboard } from "../../commands/dashboard";
import { filterContextActions, layoutActions, loadingActions } from "../state";
import { DashboardContext } from "../state/dashboardStore";

export type PromiseReturnType<T> = T extends Promise<infer U> ? U : any;
export type PromiseFnReturnType<T extends (...args: any) => any> = PromiseReturnType<ReturnType<T>>;

async function loadDashboardFromBackend(ctx: DashboardContext) {
    const { backend, workspace, dashboardRef } = ctx;

    return backend.workspace(workspace).dashboards().getDashboard(dashboardRef!);
}

export function* loadDashboardCommandHandler(ctx: DashboardContext, cmd: LoadDashboard) {
    // eslint-disable-next-line no-console
    console.debug("handling load dashboard", cmd, "in context", ctx);

    try {
        yield put(loadingActions.setLoadingStart());

        const dashboard: PromiseFnReturnType<typeof loadDashboardFromBackend> = yield call(
            loadDashboardFromBackend,
            ctx,
        );

        yield put(filterContextActions.setFilterContext(dashboard.filterContext));
        yield put(layoutActions.setLayout(dashboard.layout));
        yield put(loadingActions.setLoadingSuccess());
    } catch (e) {
        yield put(loadingActions.setLoadingError(e));
    }
}
