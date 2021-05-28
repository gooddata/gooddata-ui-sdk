// (C) 2021 GoodData Corporation
import { all, call, put, SagaReturnType } from "redux-saga/effects";
import { LoadDashboard } from "../../commands/dashboard";
import { eventDispatcher } from "../../eventEmitter/eventDispatcher";
import { dashboardLoaded } from "../../events/dashboard";
import { filterContextActions } from "../../state/filterContext";
import { insightsActions } from "../../state/insights";
import { layoutActions } from "../../state/layout";
import { loadingActions } from "../../state/loading";
import { DashboardContext } from "../../types/commonTypes";
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { loadDashboardConfig } from "./loadDashboardConfig";
import { configActions } from "../../state/config";
import { PromiseFnReturnType } from "../../types/sagas";
import { dateFilterConfigActions } from "../../state/dateFilterConfig";
import { DateFilterMergeResult, mergeDateFilterConfigWithOverrides } from "./mergeDateFilterConfigs";
import { loadPermissions } from "./loadPermissions";
import { permissionsActions } from "../../state/permissions";
import { loadCatalog } from "./loadCatalog";
import { loadDashboardAlerts } from "./loadDashboardAlerts";
import { catalogActions } from "../../state/catalog/index";
import { alertsActions } from "../../state/alerts/index";

function loadDashboardFromBackend(ctx: DashboardContext): Promise<IDashboardWithReferences> {
    const { backend, workspace, dashboardRef } = ctx;

    return backend.workspace(workspace).dashboards().getDashboardWithReferences(dashboardRef!);
}

export function* loadDashboardCommandHandler(ctx: DashboardContext, cmd: LoadDashboard) {
    // eslint-disable-next-line no-console
    console.debug("handling load dashboard", cmd, "in context", ctx);

    try {
        yield put(loadingActions.setLoadingStart());

        const [dashboardWithReferences, config, permissions, catalog, alerts]: [
            PromiseFnReturnType<typeof loadDashboardFromBackend>,
            SagaReturnType<typeof loadDashboardConfig>,
            SagaReturnType<typeof loadPermissions>,
            PromiseFnReturnType<typeof loadCatalog>,
            PromiseFnReturnType<typeof loadDashboardAlerts>,
        ] = yield all([
            call(loadDashboardFromBackend, ctx),
            call(loadDashboardConfig, ctx, cmd),
            call(loadPermissions, ctx, cmd),
            call(loadCatalog, ctx),
            call(loadDashboardAlerts, ctx),
        ]);

        const { dashboard, references } = dashboardWithReferences;
        const effectiveDateFilterConfig: DateFilterMergeResult = yield call(
            mergeDateFilterConfigWithOverrides,
            ctx,
            cmd,
            config.dateFilterConfig!,
            dashboard.dateFilterConfig,
        );

        yield put(configActions.setConfig(config));
        yield put(permissionsActions.setPermissions(permissions));

        yield put(
            catalogActions.setCatalogItems({
                attributes: catalog.attributes(),
                dateDatasets: catalog.dateDatasets(),
                facts: catalog.facts(),
                measures: catalog.measures(),
            }),
        );
        yield put(alertsActions.setAlerts(alerts));

        yield put(filterContextActions.setFilterContext(dashboard.filterContext));
        yield put(layoutActions.setLayout(dashboard.layout));
        yield put(
            dateFilterConfigActions.setDateFilterConfig({
                dateFilterConfig: dashboard.dateFilterConfig,
                effectiveDateFilterConfig: effectiveDateFilterConfig.config,
                isUsingDashboardOverrides: effectiveDateFilterConfig.source === "dashboard",
            }),
        );

        yield put(insightsActions.setInsights(references.insights));

        yield put(loadingActions.setLoadingSuccess());

        yield call(
            eventDispatcher,
            dashboardLoaded(ctx, dashboard, references.insights, config, permissions),
        );
    } catch (e) {
        yield put(loadingActions.setLoadingError(e));
    }
}
