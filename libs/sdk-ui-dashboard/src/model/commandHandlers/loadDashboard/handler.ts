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
import { batchActions } from "redux-batched-actions";
import { internalErrorOccurred } from "../../events/general";

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

        const batch = batchActions(
            [
                configActions.setConfig(config),
                permissionsActions.setPermissions(permissions),
                catalogActions.setCatalogItems({
                    attributes: catalog.attributes(),
                    dateDatasets: catalog.dateDatasets(),
                    facts: catalog.facts(),
                    measures: catalog.measures(),
                }),
                alertsActions.setAlerts(alerts),
                filterContextActions.setFilterContext(dashboard.filterContext),
                layoutActions.setLayout(dashboard.layout),
                dateFilterConfigActions.setDateFilterConfig({
                    dateFilterConfig: dashboard.dateFilterConfig,
                    effectiveDateFilterConfig: effectiveDateFilterConfig.config,
                    isUsingDashboardOverrides: effectiveDateFilterConfig.source === "dashboard",
                }),
                insightsActions.setInsights(references.insights),
            ],
            "@@GDC.DASHBOARD.BATCH.LOAD",
        );

        yield put(batch);
        yield put(loadingActions.setLoadingSuccess());

        yield call(
            eventDispatcher,
            dashboardLoaded(ctx, dashboard, references.insights, config, permissions),
        );
    } catch (e) {
        yield put(loadingActions.setLoadingError(e.message));
        yield call(
            eventDispatcher,
            internalErrorOccurred(
                ctx,
                "An unexpected error has occurred while loading dashboard",
                e,
                cmd.correlationId,
            ),
        );
    }
}
