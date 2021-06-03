// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, call, put, SagaReturnType } from "redux-saga/effects";
import { LoadDashboard } from "../../commands/dashboard";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { dashboardLoaded } from "../../events/dashboard";
import { filterContextActions } from "../../state/filterContext";
import { insightsActions } from "../../state/insights";
import { layoutActions } from "../../state/layout";
import { loadingActions } from "../../state/loading";
import { DashboardContext } from "../../types/commonTypes";
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { resolveDashboardConfig } from "./resolveDashboardConfig";
import { configActions } from "../../state/config";
import { PromiseFnReturnType } from "../../types/sagas";
import { dateFilterConfigActions } from "../../state/dateFilterConfig";
import { DateFilterMergeResult, mergeDateFilterConfigWithOverrides } from "./mergeDateFilterConfigs";
import { resolvePermissions } from "./resolvePermissions";
import { permissionsActions } from "../../state/permissions";
import { loadCatalog } from "./loadCatalog";
import { loadDashboardAlerts } from "./loadDashboardAlerts";
import { catalogActions } from "../../state/catalog/index";
import { alertsActions } from "../../state/alerts/index";
import { batchActions } from "redux-batched-actions";
import { internalErrorOccurred } from "../../events/general";
import { loadUser } from "./loadUser";
import { userActions } from "../../state/user";
import { metaActions } from "../../state/meta";

function loadDashboardFromBackend(ctx: DashboardContext): Promise<IDashboardWithReferences> {
    const { backend, workspace, dashboardRef } = ctx;

    return backend.workspace(workspace).dashboards().getDashboardWithReferences(dashboardRef!);
}

export function* loadDashboardCommandHandler(ctx: DashboardContext, cmd: LoadDashboard): SagaIterator<void> {
    try {
        yield put(loadingActions.setLoadingStart());

        const [dashboardWithReferences, config, permissions, catalog, alerts, user]: [
            PromiseFnReturnType<typeof loadDashboardFromBackend>,
            SagaReturnType<typeof resolveDashboardConfig>,
            SagaReturnType<typeof resolvePermissions>,
            PromiseFnReturnType<typeof loadCatalog>,
            PromiseFnReturnType<typeof loadDashboardAlerts>,
            PromiseFnReturnType<typeof loadUser>,
        ] = yield all([
            call(loadDashboardFromBackend, ctx),
            call(resolveDashboardConfig, ctx, cmd),
            call(resolvePermissions, ctx, cmd),
            call(loadCatalog, ctx),
            call(loadDashboardAlerts, ctx),
            call(loadUser, ctx),
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
                userActions.setUser(user),
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
                metaActions.setMeta({
                    ref: dashboard.ref,
                    title: dashboard.title,
                    updated: dashboard.updated,
                    description: dashboard.description,
                    created: dashboard.created,
                    isLocked: dashboard.isLocked,
                }),
            ],
            "@@GDC.DASH/BATCH.LOAD",
        );

        yield put(batch);
        yield put(loadingActions.setLoadingSuccess());

        yield dispatchDashboardEvent(
            dashboardLoaded(ctx, dashboard, references.insights, config, permissions, cmd.correlationId),
        );
    } catch (e) {
        yield put(loadingActions.setLoadingError(e.message));
        yield dispatchDashboardEvent(
            internalErrorOccurred(
                ctx,
                "An unexpected error has occurred while loading dashboard",
                e,
                cmd.correlationId,
            ),
        );
    }
}
